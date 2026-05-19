using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Tasks;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Enums;

namespace VoiceTask.Data.Repositories;

public class TaskRepository(AppDbContext db) : ITaskRepository
{
    public Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Tasks
             .Include(t => t.Labels)
             .Include(t => t.CreatedBy)
             .Include(t => t.Assignee)
             .FirstOrDefaultAsync(t => t.Id == id, ct);

    public Task<TaskItem?> GetByIdWithDetailsAsync(Guid id, CancellationToken ct = default)
        => db.Tasks
             .Include(t => t.Labels)
             .Include(t => t.CreatedBy)
             .Include(t => t.Assignee)
             .Include(t => t.SubTasks).ThenInclude(s => s.Labels)
             .Include(t => t.SubTasks).ThenInclude(s => s.CreatedBy)
             .Include(t => t.SubTasks).ThenInclude(s => s.Assignee)
             .FirstOrDefaultAsync(t => t.Id == id, ct);

    public async Task<PagedResult<TaskItem>> GetFilteredAsync(
        Guid currentUserId, UserRole role, TaskFilterParams filters, CancellationToken ct = default)
    {
        var query = db.Tasks
            .Include(t => t.Labels)
            .Include(t => t.CreatedBy)
            .Include(t => t.Assignee)
            .Where(t => t.ParentTaskId == null) // top-level only
            .ApplyVisibilityFilter(currentUserId, role);

        if (filters.Status.HasValue)
            query = query.Where(t => t.Status == filters.Status.Value);

        if (filters.Priority.HasValue)
            query = query.Where(t => t.Priority == filters.Priority.Value);

        if (filters.AssigneeId.HasValue)
            query = query.Where(t => t.AssigneeId == filters.AssigneeId.Value);

        if (filters.LabelId.HasValue)
            query = query.Where(t => t.Labels.Any(l => l.Id == filters.LabelId.Value));

        if (filters.DueDateFrom.HasValue)
            query = query.Where(t => t.DueDate >= filters.DueDateFrom.Value);

        if (filters.DueDateTo.HasValue)
            query = query.Where(t => t.DueDate <= filters.DueDateTo.Value);

        if (!string.IsNullOrWhiteSpace(filters.Search))
        {
            var search = filters.Search.ToLower();
            query = query.Where(t =>
                t.Title.ToLower().Contains(search) ||
                (t.Description != null && t.Description.ToLower().Contains(search)));
        }

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((filters.Page - 1) * filters.PageSize)
            .Take(filters.PageSize)
            .ToListAsync(ct);

        return new PagedResult<TaskItem>(items, total, filters.Page, filters.PageSize);
    }

    public Task<List<TaskItem>> GetUnacknowledgedAsync(Guid assigneeId, CancellationToken ct = default)
        => db.Tasks
             .Include(t => t.CreatedBy)
             .Include(t => t.Labels)
             .Where(t => t.AssigneeId == assigneeId && t.AssignmentAcknowledgedAt == null)
             .OrderByDescending(t => t.CreatedAt)
             .ToListAsync(ct);

    public Task<List<TaskItem>> GetSubTasksAsync(Guid parentId, CancellationToken ct = default)
        => db.Tasks
             .Include(t => t.Labels)
             .Include(t => t.CreatedBy)
             .Include(t => t.Assignee)
             .Where(t => t.ParentTaskId == parentId)
             .OrderBy(t => t.CreatedAt)
             .ToListAsync(ct);

    public async Task AddAsync(TaskItem task, CancellationToken ct = default)
        => await db.Tasks.AddAsync(task, ct);

    public async Task AddRangeAsync(IEnumerable<TaskItem> tasks, CancellationToken ct = default)
        => await db.Tasks.AddRangeAsync(tasks, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);

    public bool IsVisibleTo(TaskItem task, Guid userId, UserRole role)
        => role == UserRole.Admin || task.CreatedById == userId || task.AssigneeId == userId;
}

// Extension method — reused in all task queries
internal static class TaskQueryExtensions
{
    internal static IQueryable<TaskItem> ApplyVisibilityFilter(
        this IQueryable<TaskItem> query, Guid userId, UserRole role)
    {
        if (role == UserRole.Admin) return query;
        return query.Where(t => t.CreatedById == userId || t.AssigneeId == userId);
    }
}
