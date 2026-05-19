using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data.Repositories;

public class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Id == id, ct);

    public Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Email == email.ToLower(), ct);

    public Task<User?> GetByUsernameAsync(string username, CancellationToken ct = default)
        => db.Users.FirstOrDefaultAsync(u => u.Username == username.ToLower(), ct);

    public Task<User?> GetByEmailOrUsernameAsync(string emailOrUsername, CancellationToken ct = default)
    {
        var lower = emailOrUsername.ToLower();
        return db.Users.FirstOrDefaultAsync(
            u => u.Email == lower || u.Username == lower, ct);
    }

    public Task<bool> ExistsAsync(string email, string username, CancellationToken ct = default)
    {
        var emailLower = email.ToLower();
        var usernameLower = username.ToLower();
        return db.Users.AnyAsync(
            u => u.Email == emailLower || u.Username == usernameLower, ct);
    }

    public Task<int> CountAsync(CancellationToken ct = default)
        => db.Users.CountAsync(ct);

    public Task<List<User>> GetAllAsync(CancellationToken ct = default)
        => db.Users.OrderBy(u => u.Username).ToListAsync(ct);

    public async Task AddAsync(User user, CancellationToken ct = default)
        => await db.Users.AddAsync(user, ct);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => db.SaveChangesAsync(ct);
}
