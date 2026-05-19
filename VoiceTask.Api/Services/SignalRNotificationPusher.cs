using Microsoft.AspNetCore.SignalR;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Api.Hubs;
using VoiceTask.Domain.DTOs.Notifications;

namespace VoiceTask.Api.Services;

public class SignalRNotificationPusher(IHubContext<NotificationHub> hub) : INotificationPusher
{
    public Task PushAsync(Guid userId, NotificationDto dto, CancellationToken ct = default) =>
        hub.Clients.Group($"user-{userId}").SendAsync("Notification", dto, ct);
}
