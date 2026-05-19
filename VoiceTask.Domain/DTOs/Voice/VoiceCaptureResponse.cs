namespace VoiceTask.Domain.DTOs.Voice;

public record VoiceCaptureResponse(
    Guid CaptureId,
    string Transcript,
    List<ParsedTaskTree> Tasks
);
