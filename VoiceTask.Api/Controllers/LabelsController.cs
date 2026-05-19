using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Labels;

namespace VoiceTask.Api.Controllers;

[Authorize]
public class LabelsController(ILabelService labelService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LabelResponse>>> GetAll(CancellationToken ct) =>
        Ok(await labelService.GetAllAsync(ct));

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<LabelResponse>> Create(
        [FromBody] CreateLabelRequest request, CancellationToken ct)
    {
        var created = await labelService.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetAll), created);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await labelService.DeleteAsync(id, ct);
        return NoContent();
    }
}
