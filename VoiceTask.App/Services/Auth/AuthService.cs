using BCrypt.Net;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Auth;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Enums;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Auth;

public class AuthService(
    IUserRepository users,
    IRefreshTokenRepository refreshTokens,
    IJwtService jwt) : IAuthService
{
    private const int RefreshTokenDays = 30;

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await users.ExistsAsync(request.Email, request.Username, ct))
            throw new ConflictException("Email or username is already taken.");

        var isFirstUser = await users.CountAsync(ct) == 0;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            Email = request.Email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
            Role = isFirstUser ? UserRole.Admin : UserRole.Member,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
        };

        await users.AddAsync(user, ct);
        await users.SaveChangesAsync(ct);

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByEmailOrUsernameAsync(request.UsernameOrEmail, ct)
            ?? throw new ValidationException(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Invalid username/email or password."]
            });

        if (!user.IsActive)
            throw new ForbiddenException("Account is disabled.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["credentials"] = ["Invalid username/email or password."]
            });

        return await IssueTokensAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string rawRefreshToken, CancellationToken ct = default)
    {
        var hash = jwt.HashToken(rawRefreshToken);
        var stored = await refreshTokens.GetByHashAsync(hash, ct)
            ?? throw new ValidationException(new Dictionary<string, string[]>
            {
                ["refreshToken"] = ["Invalid or expired refresh token."]
            });

        if (stored.IsRevoked || stored.ExpiresAt < DateTime.UtcNow)
            throw new ValidationException(new Dictionary<string, string[]>
            {
                ["refreshToken"] = ["Invalid or expired refresh token."]
            });

        if (!stored.User.IsActive)
            throw new ForbiddenException("Account is disabled.");

        // Revoke old token before issuing new pair (prevents replay)
        await refreshTokens.RevokeAsync(stored, ct);
        await refreshTokens.SaveChangesAsync(ct);

        return await IssueTokensAsync(stored.User, ct);
    }

    public async Task LogoutAsync(string rawRefreshToken, CancellationToken ct = default)
    {
        var hash = jwt.HashToken(rawRefreshToken);
        var stored = await refreshTokens.GetByHashAsync(hash, ct);
        if (stored is null) return; // already gone — treat as success

        await refreshTokens.RevokeAsync(stored, ct);
        await refreshTokens.SaveChangesAsync(ct);
    }

    private async Task<AuthResponse> IssueTokensAsync(User user, CancellationToken ct)
    {
        var rawToken = jwt.GenerateRawRefreshToken();
        var refresh = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = jwt.HashToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenDays),
            CreatedAt = DateTime.UtcNow,
        };

        await refreshTokens.AddAsync(refresh, ct);
        await refreshTokens.SaveChangesAsync(ct);

        // Raw token is returned so the caller (controller) can set it as an HTTP-only cookie
        // Only the hash is persisted — raw token never touches the DB
        var accessToken = jwt.GenerateAccessToken(user);
        return new AuthResponse(accessToken, user.Id, user.Username, user.Email, user.Role)
        {
            RawRefreshToken = rawToken
        };
    }
}
