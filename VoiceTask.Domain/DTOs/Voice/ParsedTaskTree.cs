using System.Text.Json.Serialization;

namespace VoiceTask.Domain.DTOs.Voice;

public record ParsedTaskTree(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("priority")] string Priority,
    [property: JsonPropertyName("dueDate")] string? DueDate,
    [property: JsonPropertyName("labels")] List<string> Labels,
    [property: JsonPropertyName("subtasks")] List<ParsedSubTask> Subtasks
);

public record ParsedSubTask(
    [property: JsonPropertyName("title")] string Title,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("priority")] string Priority,
    [property: JsonPropertyName("dueDate")] string? DueDate,
    [property: JsonPropertyName("labels")] List<string> Labels
);
