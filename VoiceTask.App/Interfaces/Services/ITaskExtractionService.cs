using VoiceTask.Domain.DTOs.Voice;

namespace VoiceTask.App.Interfaces.Services;

public interface ITaskExtractionService
{
    Task<List<ParsedTaskTree>> ExtractAsync(string transcript, CancellationToken ct = default);
}
