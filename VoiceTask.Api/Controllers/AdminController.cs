using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Admin;

namespace VoiceTask.Api.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController(IAdminService adminService) : ApiControllerBase
{
    [HttpGet("users")]
    public async Task<ActionResult<List<UserResponse>>> GetUsers(CancellationToken ct) =>
        Ok(await adminService.GetUsersAsync(ct));

    [HttpPatch("users/{id:guid}")]
    public async Task<ActionResult<UserResponse>> PatchUser(
        Guid id, [FromBody] PatchUserRequest request, CancellationToken ct) =>
        Ok(await adminService.PatchUserAsync(id, request, ct));
}
