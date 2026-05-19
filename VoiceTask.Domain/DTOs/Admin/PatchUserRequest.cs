using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.DTOs.Admin;

public record PatchUserRequest(
    UserRole? Role = null,
    bool? IsActive = null
);
