using VoiceTask.Domain.Entities;

namespace VoiceTask.Domain.Interfaces.Repositories;

public interface IVoiceCaptureRepository
{
    Task<VoiceCapture?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(VoiceCapture capture, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
