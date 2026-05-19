using System.Security.Claims;
using VoiceTask.Domain.Entities;

namespace VoiceTask.App.Interfaces.Services;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRawRefreshToken();
    string HashToken(string rawToken);
    ClaimsPrincipal? ValidateAccessToken(string token);
    Guid? GetUserIdFromToken(string token);
}
