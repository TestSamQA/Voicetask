using VoiceTask.Domain.Enums;
using TaskStatus = VoiceTask.Domain.Enums.TaskStatus;

namespace VoiceTask.Domain.DTOs.Tasks;

public record TaskDetailResponse(
    Guid Id,
    string Title,
    string? Description,
    Priority Priority,
    TaskStatus Status,
    DateOnly? DueDate,
    bool IsDeleted,
    DateTime? AssignmentAcknowledgedAt,
    Guid CreatedById,
    string CreatedByUsername,
    Guid? AssigneeId,
    string? AssigneeUsername,
    Guid? ParentTaskId,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    List<LabelSummary> Labels,
    List<TaskResponse> SubTasks
);
