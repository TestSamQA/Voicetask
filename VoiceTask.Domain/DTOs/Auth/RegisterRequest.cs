using System.ComponentModel.DataAnnotations;

namespace VoiceTask.Domain.DTOs.Auth;

public record RegisterRequest(
    [Required, StringLength(50, MinimumLength = 2)] string Username,
    [Required, EmailAddress, StringLength(254)] string Email,
    [Required, StringLength(100, MinimumLength = 8)] string Password
);
