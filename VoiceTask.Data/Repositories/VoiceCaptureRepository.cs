using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data.Repositories;

public class VoiceCaptureRepository(AppDbContext db) : IVoiceCaptureRepository
{
    public Task<VoiceCapture?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.VoiceCaptures.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task AddAsync(VoiceCapture capture, CancellationToken ct = default)
        => await db.VoiceCaptures.AddAsync(capture, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
