using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Voice;

namespace VoiceTask.Api.Controllers;

[Authorize]
public class VoiceController(IVoiceService voice) : ApiControllerBase
{
    [HttpPost("extract")]
    public async Task<ActionResult<VoiceCaptureResponse>> Extract(
        [FromBody] ExtractRequest request, CancellationToken ct)
    {
        var result = await voice.ExtractAsync(request.Transcript, CurrentUserId, ct);
        return Ok(result);
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<List<Guid>>> Confirm(
        [FromBody] ConfirmVoiceRequest request, CancellationToken ct)
    {
        var taskIds = await voice.ConfirmAsync(request, CurrentUserId, ct);
        return Ok(taskIds);
    }
}
