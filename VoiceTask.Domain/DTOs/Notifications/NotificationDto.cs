namespace VoiceTask.Domain.DTOs.Notifications;

public record NotificationDto(
    Guid Id,
    string Message,
    Guid? TaskId,
    string? ActorUsername,
    bool IsRead,
    DateTime CreatedAt
);
