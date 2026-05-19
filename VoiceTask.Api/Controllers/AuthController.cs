using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Auth;

namespace VoiceTask.Api.Controllers;

public class AuthController(IAuthService auth) : ApiControllerBase
{
    private const string RefreshTokenCookie = "refreshToken";
    private static readonly CookieOptions CookieOpts = new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        MaxAge = TimeSpan.FromDays(30),
        Path = "/api/v1/auth",
    };

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(
        [FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await auth.RegisterAsync(request, ct);
        SetRefreshCookie(result.RawRefreshToken!);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(
        [FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await auth.LoginAsync(request, ct);
        SetRefreshCookie(result.RawRefreshToken!);
        return Ok(result);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(CancellationToken ct)
    {
        var raw = Request.Cookies[RefreshTokenCookie];
        if (string.IsNullOrEmpty(raw))
            return Unauthorized(new { detail = "No refresh token provided." });

        var result = await auth.RefreshAsync(raw, ct);
        SetRefreshCookie(result.RawRefreshToken!);
        return Ok(result);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var raw = Request.Cookies[RefreshTokenCookie];
        if (!string.IsNullOrEmpty(raw))
            await auth.LogoutAsync(raw, ct);

        Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth",
        });
        return NoContent();
    }

    private void SetRefreshCookie(string rawToken) =>
        Response.Cookies.Append(RefreshTokenCookie, rawToken, CookieOpts);
}
