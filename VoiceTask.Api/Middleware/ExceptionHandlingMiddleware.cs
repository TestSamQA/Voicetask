using System.Text.Json;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.Api.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (AppException ex)
        {
            await WriteProblemAsync(context, ex.StatusCode, ex.Message, ex);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled exception");
            await WriteProblemAsync(context, 500, "An unexpected error occurred.", ex);
        }
    }

    private static async Task WriteProblemAsync(
        HttpContext context, int status, string detail, Exception ex)
    {
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/problem+json";

        var problem = new Dictionary<string, object>
        {
            ["type"] = $"https://httpstatuses.com/{status}",
            ["title"] = ReasonPhrase(status),
            ["status"] = status,
            ["detail"] = detail,
        };

        if (ex is Domain.Exceptions.ValidationException ve)
            problem["errors"] = ve.Errors;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problem));
    }

    private static string ReasonPhrase(int status) => status switch
    {
        400 => "Bad Request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        409 => "Conflict",
        422 => "Unprocessable Entity",
        _ => "Internal Server Error",
    };
}
