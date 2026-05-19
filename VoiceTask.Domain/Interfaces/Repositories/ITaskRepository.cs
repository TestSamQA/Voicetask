using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Tasks;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.Interfaces.Repositories;

public interface ITaskRepository
{
    Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TaskItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default);
    Task<PagedResult<TaskItem>> GetFilteredAsync(
        Guid currentUserId, UserRole role, TaskFilterParams filters, CancellationToken ct = default);
    Task<List<TaskItem>> GetUnacknowledgedAsync(Guid assigneeId, CancellationToken ct = default);
    Task<List<TaskItem>> GetSubTasksAsync(Guid parentId, CancellationToken ct = default);
    Task AddAsync(TaskItem task, CancellationToken ct = default);
    Task AddRangeAsync(IEnumerable<TaskItem> tasks, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
    bool IsVisibleTo(TaskItem task, Guid userId, UserRole role);
}
