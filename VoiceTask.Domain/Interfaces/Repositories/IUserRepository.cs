using VoiceTask.Domain.Entities;

namespace VoiceTask.Domain.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<User?> GetByEmailAsync(string email, CancellationToken ct = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default);
    Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername, CancellationToken ct = default);
    Task<bool> ExistsAsync(string email, string username, CancellationToken ct = default);
    Task<int> CountAsync(CancellationToken ct = default);
    Task<List<User>> GetAllAsync(CancellationToken ct = default);
    Task AddAsync(User user, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
