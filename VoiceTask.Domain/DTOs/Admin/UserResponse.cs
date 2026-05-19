using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.DTOs.Admin;

public record UserResponse(
    Guid Id,
    string Username,
    string Email,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt
);
