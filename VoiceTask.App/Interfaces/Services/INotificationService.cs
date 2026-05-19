using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Notifications;

namespace VoiceTask.App.Interfaces.Services;

public interface INotificationService
{
    Task SendAsync(Guid recipientId, Guid? actorId, Guid? taskId, string message, CancellationToken ct = default);

    Task<PagedResult<NotificationDto>> GetForUserAsync(
        Guid userId, bool? isRead, int page, int pageSize, CancellationToken ct = default);

    Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default);

    Task MarkAllReadAsync(Guid userId, CancellationToken ct = default);
}
