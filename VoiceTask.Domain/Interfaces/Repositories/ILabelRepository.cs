using VoiceTask.Domain.Entities;

namespace VoiceTask.Domain.Interfaces.Repositories;

public interface ILabelRepository
{
    Task<List<Label>> GetAllAsync(CancellationToken ct = default);
    Task<Label?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Label?> GetByNameAsync(string name, CancellationToken ct = default);
    Task<List<Label>> GetByNamesAsync(IEnumerable<string> names, CancellationToken ct = default);
    Task<List<Label>> GetByIdsAsync(IEnumerable<Guid> ids, CancellationToken ct = default);
    Task AddAsync(Label label, CancellationToken ct = default);
    Task RemoveAsync(Label label, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
