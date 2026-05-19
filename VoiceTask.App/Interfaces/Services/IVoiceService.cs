using VoiceTask.Domain.DTOs.Voice;

namespace VoiceTask.App.Interfaces.Services;

public interface IVoiceService
{
    Task<VoiceCaptureResponse> ExtractAsync(
        string transcript, Guid userId, CancellationToken ct = default);

    Task<List<Guid>> ConfirmAsync(
        ConfirmVoiceRequest request, Guid userId, CancellationToken ct = default);
}
