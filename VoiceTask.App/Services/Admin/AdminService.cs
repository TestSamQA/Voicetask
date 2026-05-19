using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Admin;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Admin;

public class AdminService(IUserRepository users) : IAdminService
{
    public async Task<List<UserResponse>> GetUsersAsync(CancellationToken ct = default)
    {
        var all = await users.GetAllAsync(ct);
        return all.Select(MapUser).ToList();
    }

    public async Task<UserResponse> PatchUserAsync(
        Guid userId, PatchUserRequest request, CancellationToken ct = default)
    {
        var user = await users.GetByIdAsync(userId, ct)
            ?? throw new NotFoundException("User", userId);

        if (request.Role.HasValue) user.Role = request.Role.Value;
        if (request.IsActive.HasValue) user.IsActive = request.IsActive.Value;

        await users.SaveChangesAsync(ct);
        return MapUser(user);
    }

    private static UserResponse MapUser(Domain.Entities.User u) =>
        new(u.Id, u.Username, u.Email, u.Role, u.IsActive, u.CreatedAt);
}
