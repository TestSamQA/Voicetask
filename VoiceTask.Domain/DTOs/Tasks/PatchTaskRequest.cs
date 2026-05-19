using VoiceTask.Domain.Enums;
using TaskStatus = VoiceTask.Domain.Enums.TaskStatus;

namespace VoiceTask.Domain.DTOs.Tasks;

public record PatchTaskRequest(
    string? Title = null,
    string? Description = null,
    Priority? Priority = null,
    TaskStatus? Status = null,
    DateOnly? DueDate = null,
    Guid? AssigneeId = null,
    List<Guid>? LabelIds = null
);
