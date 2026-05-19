using Microsoft.Extensions.Logging;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Notifications;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Notifications;

public class NotificationService(
    INotificationRepository notifications,
    IUserRepository users,
    INotificationPusher pusher,
    ILogger<NotificationService> logger) : INotificationService
{
    public async Task SendAsync(
        Guid recipientId, Guid? actorId, Guid? taskId, string message, CancellationToken ct = default)
    {
        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            RecipientId = recipientId,
            ActorId = actorId,
            TaskId = taskId,
            Message = message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
        };

        try
        {
            await notifications.AddAsync(notification, ct);
            await notifications.SaveChangesAsync(ct);

            string? actorUsername = null;
            if (actorId.HasValue)
            {
                var actor = await users.GetByIdAsync(actorId.Value, ct);
                actorUsername = actor?.Username;
            }

            var dto = new NotificationDto(
                notification.Id, message, taskId, actorUsername, false, notification.CreatedAt);

            await pusher.PushAsync(recipientId, dto, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex,
                "Failed to send notification to user {RecipientId} for task {TaskId}",
                recipientId, taskId);
            // Never propagate — notifications are best-effort and must not fail parent operations
        }
    }

    public async Task<PagedResult<NotificationDto>> GetForUserAsync(
        Guid userId, bool? isRead, int page, int pageSize, CancellationToken ct = default)
    {
        var paged = await notifications.GetForUserAsync(userId, isRead, page, pageSize, ct);
        return paged.Map(n => new NotificationDto(
            n.Id, n.Message, n.TaskId, null, n.IsRead, n.CreatedAt));
    }

    public async Task MarkReadAsync(Guid notificationId, Guid userId, CancellationToken ct = default)
    {
        var notification = await notifications.GetByIdAsync(notificationId, ct)
            ?? throw new NotFoundException("Notification", notificationId);

        if (notification.RecipientId != userId)
            throw new ForbiddenException("This notification does not belong to you.");

        notification.IsRead = true;
        await notifications.SaveChangesAsync(ct);
    }

    public Task MarkAllReadAsync(Guid userId, CancellationToken ct = default) =>
        notifications.MarkAllReadAsync(userId, ct);
}
