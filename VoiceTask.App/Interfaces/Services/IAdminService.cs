using VoiceTask.Domain.DTOs.Admin;

namespace VoiceTask.App.Interfaces.Services;

public interface IAdminService
{
    Task<List<UserResponse>> GetUsersAsync(CancellationToken ct = default);
    Task<UserResponse> PatchUserAsync(Guid userId, PatchUserRequest request, CancellationToken ct = default);
}
