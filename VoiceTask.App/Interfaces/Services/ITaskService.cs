using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Tasks;
using VoiceTask.Domain.Enums;

namespace VoiceTask.App.Interfaces.Services;

public interface ITaskService
{
    Task<PagedResult<TaskResponse>> GetTasksAsync(
        Guid currentUserId, UserRole role, TaskFilterParams filters, CancellationToken ct = default);

    Task<TaskDetailResponse> GetTaskByIdAsync(
        Guid id, Guid currentUserId, UserRole role, CancellationToken ct = default);

    Task<TaskResponse> CreateTaskAsync(
        CreateTaskRequest request, Guid currentUserId, CancellationToken ct = default);

    Task<TaskResponse> UpdateTaskAsync(
        Guid id, UpdateTaskRequest request, Guid currentUserId, UserRole role, CancellationToken ct = default);

    Task<TaskResponse> PatchTaskAsync(
        Guid id, PatchTaskRequest request, Guid currentUserId, UserRole role, CancellationToken ct = default);

    Task DeleteTaskAsync(Guid id, Guid currentUserId, UserRole role, CancellationToken ct = default);

    Task<List<TaskResponse>> GetUnacknowledgedAsync(Guid currentUserId, CancellationToken ct = default);

    Task AcknowledgeAsync(Guid id, Guid currentUserId, CancellationToken ct = default);

    Task<List<TaskResponse>> GetSubTasksAsync(
        Guid parentId, Guid currentUserId, UserRole role, CancellationToken ct = default);
}
