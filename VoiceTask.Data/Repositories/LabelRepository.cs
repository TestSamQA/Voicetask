using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data.Repositories;

public class LabelRepository(AppDbContext db) : ILabelRepository
{
    public Task<List<Label>> GetAllAsync(CancellationToken ct = default)
        => db.Labels.OrderBy(l => l.Name).ToListAsync(ct);

    public Task<Label?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Labels.FirstOrDefaultAsync(l => l.Id == id, ct);

    public Task<Label?> GetByNameAsync(string name, CancellationToken ct = default)
        => db.Labels.FirstOrDefaultAsync(l => l.Name == name.ToLower(), ct);

    public Task<List<Label>> GetByNamesAsync(IEnumerable<string> names, CancellationToken ct = default)
    {
        var lower = names.Select(n => n.ToLower()).ToList();
        return db.Labels.Where(l => lower.Contains(l.Name)).ToListAsync(ct);
    }

    public Task<List<Label>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default)
    {
        var idList = ids.ToList();
        return db.Labels.Where(l => idList.Contains(l.Id)).ToListAsync(ct);
    }

    public async Task AddAsync(Label label, CancellationToken ct = default)
        => await db.Labels.AddAsync(label, ct);

    public Task RemoveAsync(Label label, CancellationToken ct = default)
    {
        db.Labels.Remove(label);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
