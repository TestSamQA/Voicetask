using System.ComponentModel.DataAnnotations;
using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.DTOs.Tasks;

public record CreateTaskRequest(
    [Required, StringLength(200, MinimumLength = 1)] string Title,
    string? Description,
    Priority Priority = Priority.Medium,
    DateOnly? DueDate = null,
    Guid? AssigneeId = null,
    Guid? ParentTaskId = null,
    List<Guid>? LabelIds = null
);
