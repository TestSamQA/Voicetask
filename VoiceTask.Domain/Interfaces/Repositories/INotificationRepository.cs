using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Domain.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<PagedResult<Notification>> GetForUserAsync(
        Guid userId, bool? isRead, int page, int pageSize, CancellationToken ct = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(Notification notification, CancellationToken ct = default);
    Task MarkAllReadAsync(Guid userId, CancellationToken ct = default);
    Task DeleteOlderThanAsync(DateTime cutoff, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
