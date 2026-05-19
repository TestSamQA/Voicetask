using System.ComponentModel.DataAnnotations;
using VoiceTask.Domain.Enums;
using TaskStatus = VoiceTask.Domain.Enums.TaskStatus;

namespace VoiceTask.Domain.DTOs.Tasks;

public record UpdateTaskRequest(
    [Required, StringLength(200, MinimumLength = 1)] string Title,
    string? Description,
    Priority Priority,
    TaskStatus Status,
    DateOnly? DueDate,
    Guid? AssigneeId,
    List<Guid>? LabelIds
);
