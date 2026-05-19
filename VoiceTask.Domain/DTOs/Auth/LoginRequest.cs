using System.ComponentModel.DataAnnotations;

namespace VoiceTask.Domain.DTOs.Auth;

public record LoginRequest(
    [Required] string UsernameOrEmail,
    [Required] string Password
);
