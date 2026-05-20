using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.Domain.Enums;

namespace VoiceTask.Api.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid CurrentUserId =>
        Guid.Parse(User.FindFirst(JwtRegisteredClaimNames.Sub)!.Value);

    protected UserRole CurrentUserRole =>
        Enum.Parse<UserRole>(User.FindFirst("role")!.Value);
}
