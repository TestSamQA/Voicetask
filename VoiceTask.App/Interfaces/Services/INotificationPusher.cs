using VoiceTask.Domain.DTOs.Notifications;

namespace VoiceTask.App.Interfaces.Services;

public interface INotificationPusher
{
    Task PushAsync(Guid userId, NotificationDto dto, CancellationToken ct = default);
}
