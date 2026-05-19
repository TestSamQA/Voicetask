using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data.Repositories;

public class NotificationRepository(AppDbContext db) : INotificationRepository
{
    public async Task<PagedResult<Notification>> GetForUserAsync(
        Guid userId, bool? isRead, int page, int pageSize, CancellationToken ct = default)
    {
        var query = db.Notifications
            .Where(n => n.RecipientId == userId);

        if (isRead.HasValue)
            query = query.Where(n => n.IsRead == isRead.Value);

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new PagedResult<Notification>(items, total, page, pageSize);
    }

    public Task<Notification?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Notifications.FirstOrDefaultAsync(n => n.Id == id, ct);

    public Task<int> CountUnreadAsync(Guid userId, CancellationToken ct = default)
        => db.Notifications.CountAsync(n => n.RecipientId == userId && !n.IsRead, ct);

    public async Task AddAsync(Notification notification, CancellationToken ct = default)
        => await db.Notifications.AddAsync(notification, ct);

    public Task MarkAllReadAsync(Guid userId, CancellationToken ct = default)
        => db.Notifications
             .Where(n => n.RecipientId == userId && !n.IsRead)
             .ExecuteUpdateAsync(s => s.SetProperty(n => n.IsRead, true), ct);

    public Task DeleteOlderThanAsync(DateTime cutoff, CancellationToken ct = default)
        => db.Notifications
             .Where(n => n.CreatedAt < cutoff)
             .ExecuteDeleteAsync(ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
