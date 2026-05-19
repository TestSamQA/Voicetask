using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Tasks;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Enums;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Tasks;

public class TaskService(
    ITaskRepository tasks,
    ILabelRepository labels,
    IUserRepository users,
    INotificationService notifications) : ITaskService
{
    public async Task<PagedResult<TaskResponse>> GetTasksAsync(
        Guid currentUserId, UserRole role, TaskFilterParams filters, CancellationToken ct = default)
    {
        var paged = await tasks.GetFilteredAsync(currentUserId, role, filters, ct);
        return paged.Map(MapToResponse);
    }

    public async Task<TaskDetailResponse> GetTaskByIdAsync(
        Guid id, Guid currentUserId, UserRole role, CancellationToken ct = default)
    {
        var task = await tasks.GetByIdWithDetailsAsync(id, ct)
            ?? throw new NotFoundException("Task", id);

        if (!tasks.IsVisibleTo(task, currentUserId, role))
            throw new ForbiddenException("You do not have access to this task.");

        return MapToDetailResponse(task);
    }

    public async Task<TaskResponse> CreateTaskAsync(
        CreateTaskRequest request, Guid currentUserId, CancellationToken ct = default)
    {
        if (request.ParentTaskId.HasValue)
        {
            var parent = await tasks.GetByIdAsync(request.ParentTaskId.Value, ct)
                ?? throw new NotFoundException("Parent task", request.ParentTaskId.Value);

            // Max nesting depth = 1: subtasks cannot themselves have subtasks
            if (parent.ParentTaskId.HasValue)
                throw new Domain.Exceptions.ValidationException(new Dictionary<string, string[]>
                {
                    ["parentTaskId"] = ["Cannot nest tasks more than one level deep."]
                });
        }

        if (request.AssigneeId.HasValue)
        {
            var assignee = await users.GetByIdAsync(request.AssigneeId.Value, ct)
                ?? throw new NotFoundException("Assignee", request.AssigneeId.Value);

            if (!assignee.IsActive)
                throw new Domain.Exceptions.ValidationException(new Dictionary<string, string[]>
                {
                    ["assigneeId"] = ["Assignee account is inactive."]
                });
        }

        var resolvedLabels = request.LabelIds?.Count > 0
            ? await labels.GetByIdsAsync(request.LabelIds, ct)
            : [];

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            Status = Domain.Enums.TaskStatus.ToDo,
            DueDate = request.DueDate,
            CreatedById = currentUserId,
            AssigneeId = request.AssigneeId,
            ParentTaskId = request.ParentTaskId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Labels = resolvedLabels,
        };

        await tasks.AddAsync(task, ct);
        await tasks.SaveChangesAsync(ct);

        // Reload with navigation properties for the response
        var created = await tasks.GetByIdAsync(task.Id, ct) ?? task;

        if (request.AssigneeId.HasValue && request.AssigneeId != currentUserId)
        {
            _ = Task.Run(() => notifications.SendAsync(
                request.AssigneeId.Value, currentUserId, task.Id,
                $"You have been assigned a new task: \"{task.Title}\""), CancellationToken.None);
        }

        return MapToResponse(created);
    }

    public async Task<TaskResponse> UpdateTaskAsync(
        Guid id, UpdateTaskRequest request, Guid currentUserId, UserRole role, CancellationToken ct = default)
    {
        var task = await tasks.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Task", id);

        if (!tasks.IsVisibleTo(task, currentUserId, role))
            throw new ForbiddenException("You do not have access to this task.");

        var previousAssigneeId = task.AssigneeId;

        if (request.AssigneeId.HasValue)
        {
            var assignee = await users.GetByIdAsync(request.AssigneeId.Value, ct)
                ?? throw new NotFoundException("Assignee", request.AssigneeId.Value);

            if (!assignee.IsActive)
                throw new Domain.Exceptions.ValidationException(new Dictionary<string, string[]>
                {
                    ["assigneeId"] = ["Assignee account is inactive."]
                });
        }

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;
        task.Status = request.Status;
        task.DueDate = request.DueDate;
        task.AssigneeId = request.AssigneeId;
        task.UpdatedAt = DateTime.UtcNow;

        if (request.LabelIds is not null)
        {
            task.Labels = request.LabelIds.Count > 0
                ? await labels.GetByIdsAsync(request.LabelIds, ct)
                : [];
        }

        await tasks.SaveChangesAsync(ct);

        NotifyAssigneeChange(task, previousAssigneeId, currentUserId);

        return MapToResponse(task);
    }

    public async Task<TaskResponse> PatchTaskAsync(
        Guid id, PatchTaskRequest request, Guid currentUserId, UserRole role, CancellationToken ct = default)
    {
        var task = await tasks.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Task", id);

        if (!tasks.IsVisibleTo(task, currentUserId, role))
            throw new ForbiddenException("You do not have access to this task.");

        var previousAssigneeId = task.AssigneeId;
        var changed = false;

        if (request.Title is not null) { task.Title = request.Title; changed = true; }
        if (request.Description is not null) { task.Description = request.Description; changed = true; }
        if (request.Priority.HasValue) { task.Priority = request.Priority.Value; changed = true; }
        if (request.Status.HasValue) { task.Status = request.Status.Value; changed = true; }
        if (request.DueDate.HasValue) { task.DueDate = request.DueDate.Value; changed = true; }

        if (request.AssigneeId.HasValue)
        {
            var assignee = await users.GetByIdAsync(request.AssigneeId.Value, ct)
                ?? throw new NotFoundException("Assignee", request.AssigneeId.Value);

            if (!assignee.IsActive)
                throw new Domain.Exceptions.ValidationException(new Dictionary<string, string[]>
                {
                    ["assigneeId"] = ["Assignee account is inactive."]
                });

            task.AssigneeId = request.AssigneeId.Value;
            changed = true;
        }

        if (request.LabelIds is not null)
        {
            task.Labels = request.LabelIds.Count > 0
                ? await labels.GetByIdsAsync(request.LabelIds, ct)
                : [];
            changed = true;
        }

        if (changed) task.UpdatedAt = DateTime.UtcNow;

        await tasks.SaveChangesAsync(ct);

        NotifyAssigneeChange(task, previousAssigneeId, currentUserId);

        return MapToResponse(task);
    }

    public async Task DeleteTaskAsync(Guid id, Guid currentUserId, UserRole role, CancellationToken ct = default)
    {
        var task = await tasks.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Task", id);

        if (!tasks.IsVisibleTo(task, currentUserId, role))
            throw new ForbiddenException("You do not have access to this task.");

        task.IsDeleted = true;
        task.UpdatedAt = DateTime.UtcNow;
        await tasks.SaveChangesAsync(ct);
    }

    public async Task<List<TaskResponse>> GetUnacknowledgedAsync(Guid currentUserId, CancellationToken ct = default)
    {
        var list = await tasks.GetUnacknowledgedAsync(currentUserId, ct);
        return list.Select(MapToResponse).ToList();
    }

    public async Task AcknowledgeAsync(Guid id, Guid currentUserId, CancellationToken ct = default)
    {
        var task = await tasks.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Task", id);

        if (task.AssigneeId != currentUserId)
            throw new ForbiddenException("Only the assignee can acknowledge this task.");

        task.AssignmentAcknowledgedAt = DateTime.UtcNow;
        task.UpdatedAt = DateTime.UtcNow;
        await tasks.SaveChangesAsync(ct);
    }

    public async Task<List<TaskResponse>> GetSubTasksAsync(
        Guid parentId, Guid currentUserId, UserRole role, CancellationToken ct = default)
    {
        var parent = await tasks.GetByIdAsync(parentId, ct)
            ?? throw new NotFoundException("Task", parentId);

        if (!tasks.IsVisibleTo(parent, currentUserId, role))
            throw new ForbiddenException("You do not have access to this task.");

        var subTasks = await tasks.GetSubTasksAsync(parentId, ct);
        return subTasks.Select(MapToResponse).ToList();
    }

    private void NotifyAssigneeChange(TaskItem task, Guid? previousAssigneeId, Guid currentUserId)
    {
        if (task.AssigneeId.HasValue
            && task.AssigneeId != previousAssigneeId
            && task.AssigneeId != currentUserId)
        {
            _ = Task.Run(() => notifications.SendAsync(
                task.AssigneeId.Value, currentUserId, task.Id,
                $"You have been assigned a task: \"{task.Title}\""), CancellationToken.None);
        }
    }

    private static TaskResponse MapToResponse(TaskItem t) => new(
        t.Id, t.Title, t.Description, t.Priority, t.Status,
        t.DueDate, t.IsDeleted, t.AssignmentAcknowledgedAt,
        t.CreatedById, t.CreatedBy?.Username ?? string.Empty,
        t.AssigneeId, t.Assignee?.Username,
        t.ParentTaskId, t.CreatedAt, t.UpdatedAt,
        t.Labels.Select(l => new LabelSummary(l.Id, l.Name, l.Colour)).ToList(),
        t.SubTasks.Count);

    private static TaskDetailResponse MapToDetailResponse(TaskItem t) => new(
        t.Id, t.Title, t.Description, t.Priority, t.Status,
        t.DueDate, t.IsDeleted, t.AssignmentAcknowledgedAt,
        t.CreatedById, t.CreatedBy?.Username ?? string.Empty,
        t.AssigneeId, t.Assignee?.Username,
        t.ParentTaskId, t.CreatedAt, t.UpdatedAt,
        t.Labels.Select(l => new LabelSummary(l.Id, l.Name, l.Colour)).ToList(),
        t.SubTasks.Select(MapToResponse).ToList());
}
