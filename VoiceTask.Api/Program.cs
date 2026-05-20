using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using VoiceTask.Api.BackgroundServices;
using VoiceTask.Api.Hubs;
using VoiceTask.Api.Middleware;
using VoiceTask.Api.Services;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.App.Services.Admin;
using VoiceTask.App.Services.Auth;
using VoiceTask.App.Services.Labels;
using VoiceTask.App.Services.Notifications;
using VoiceTask.App.Services.Tasks;
using VoiceTask.App.Services.Voice;
using VoiceTask.Data;
using VoiceTask.Data.Repositories;

// ── Bootstrap Serilog before the host is built ───────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, cfg) =>
        cfg.ReadFrom.Configuration(ctx.Configuration)
           .ReadFrom.Services(services)
           .WriteTo.Console());

    // ── Database ─────────────────────────────────────────────────────────────
    builder.Services.AddDbContext<AppDbContext>(opts =>
        opts.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

    // ── Repositories ─────────────────────────────────────────────────────────
    builder.Services.AddScoped<IUserRepository, UserRepository>();
    builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
    builder.Services.AddScoped<ITaskRepository, TaskRepository>();
    builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
    builder.Services.AddScoped<ILabelRepository, LabelRepository>();
    builder.Services.AddScoped<IVoiceCaptureRepository, VoiceCaptureRepository>();

    // ── Services ─────────────────────────────────────────────────────────────
    builder.Services.AddScoped<IJwtService, JwtService>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITaskService, TaskService>();
    builder.Services.AddScoped<ILabelService, LabelService>();
    builder.Services.AddScoped<IAdminService, AdminService>();
    builder.Services.AddScoped<INotificationService, NotificationService>();
    builder.Services.AddScoped<ITaskExtractionService, TaskExtractionService>();
    builder.Services.AddScoped<IVoiceService, VoiceService>();
    builder.Services.AddScoped<INotificationPusher, SignalRNotificationPusher>();

    // ── Named HTTP clients ────────────────────────────────────────────────────
    builder.Services.AddHttpClient("Claude", c =>
    {
        c.BaseAddress = new Uri("https://api.anthropic.com/v1/");
        c.Timeout = TimeSpan.FromSeconds(120);
    });

    // ── JWT Authentication ────────────────────────────────────────────────────
    var jwtKey = builder.Configuration["Jwt:SecretKey"]
        ?? throw new InvalidOperationException("Jwt:SecretKey is not configured.");

    builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(opts =>
        {
            opts.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateIssuer = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "voicetask",
                ValidateAudience = true,
                ValidAudience = builder.Configuration["Jwt:Audience"] ?? "voicetask",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
            };

            // Allow JWT via query string for SignalR WebSocket connections
            opts.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    var token = ctx.Request.Query["access_token"];
                    if (!string.IsNullOrEmpty(token) &&
                        ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                        ctx.Token = token;
                    return Task.CompletedTask;
                }
            };
        });

    builder.Services.AddAuthorization();

    // ── SignalR ───────────────────────────────────────────────────────────────
    builder.Services.AddSignalR();

    // ── CORS ──────────────────────────────────────────────────────────────────
    var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "")
        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

    builder.Services.AddCors(opts => opts.AddDefaultPolicy(policy =>
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials())); // required for SignalR + cookies

    // ── Rate Limiting ─────────────────────────────────────────────────────────
    builder.Services.AddRateLimiter(opts =>
    {
        opts.AddFixedWindowLimiter("auth", limiter =>
        {
            limiter.PermitLimit = 10;
            limiter.Window = TimeSpan.FromMinutes(1);
            limiter.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            limiter.QueueLimit = 0;
        });
        opts.RejectionStatusCode = 429;
    });

    // ── Controllers + OpenAPI ─────────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddOpenApi();

    // ── Background Services ───────────────────────────────────────────────────
    builder.Services.AddHostedService<NotificationCleanupService>();

    // ─────────────────────────────────────────────────────────────────────────
    var app = builder.Build();

    app.UseSerilogRequestLogging();

    if (app.Environment.IsDevelopment())
        app.MapOpenApi();

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseCors();
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();

    // Rate limiting on auth endpoints only
    app.MapControllers();
    app.MapGroup("api/v1/auth")
       .RequireRateLimiting("auth");

    app.MapHub<NotificationHub>("/hubs/notifications");

    // Always run migrations on startup — safe to run repeatedly (EF tracks applied migrations)
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
    }

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application startup failed");
}
finally
{
    Log.CloseAndFlush();
}
