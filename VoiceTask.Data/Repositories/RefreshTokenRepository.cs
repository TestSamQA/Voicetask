using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data.Repositories;

public class RefreshTokenRepository(AppDbContext db) : IRefreshTokenRepository
{
    public Task<RefreshToken?> GetByHashAsync(string tokenHash, CancellationToken ct = default)
        => db.RefreshTokens.FirstOrDefaultAsync(
            t => t.Token == tokenHash && !t.IsRevoked && t.ExpiresAt > DateTime.UtcNow, ct);

    public async Task AddAsync(RefreshToken token, CancellationToken ct = default)
        => await db.RefreshTokens.AddAsync(token, ct);

    public Task RevokeAsync(RefreshToken token, CancellationToken ct = default)
    {
        token.IsRevoked = true;
        return Task.CompletedTask;
    }

    public Task RevokeAllForUserAsync(Guid userId, CancellationToken ct = default)
        => db.RefreshTokens
             .Where(t => t.UserId == userId && !t.IsRevoked)
             .ExecuteUpdateAsync(s => s.SetProperty(t => t.IsRevoked, true), ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
