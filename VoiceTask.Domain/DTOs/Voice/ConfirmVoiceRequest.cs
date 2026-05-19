using System.ComponentModel.DataAnnotations;

namespace VoiceTask.Domain.DTOs.Voice;

public record ConfirmVoiceRequest(
    [Required] Guid CaptureId,
    [Required] List<ConfirmTaskDto> Tasks
);

public record ConfirmTaskDto(
    [Required] string Title,
    string? Description,
    int Priority,
    string? DueDate,
    Guid? AssigneeId,
    List<Guid> LabelIds,
    List<ConfirmSubTaskDto> SubTasks
);

public record ConfirmSubTaskDto([Required] string Title);
