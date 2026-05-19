using VoiceTask.Domain.Enums;
using TaskStatus = VoiceTask.Domain.Enums.TaskStatus;

namespace VoiceTask.Domain.DTOs.Tasks;

public record TaskFilterParams(
    TaskStatus? Status = null,
    Priority? Priority = null,
    Guid? AssigneeId = null,
    Guid? LabelId = null,
    DateOnly? DueDateFrom = null,
    DateOnly? DueDateTo = null,
    string? Search = null,
    int Page = 1,
    int PageSize = 20
);
