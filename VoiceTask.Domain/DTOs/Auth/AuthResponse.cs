using System.Text.Json.Serialization;
using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.DTOs.Auth;

public record AuthResponse(
    string AccessToken,
    Guid UserId,
    string Username,
    string Email,
    UserRole Role
)
{
    // Populated by the service; extracted by the controller to set HTTP-only cookie.
    // JsonIgnore ensures it never leaks into the serialized API response body.
    [JsonIgnore]
    public string? RawRefreshToken { get; init; }
};
