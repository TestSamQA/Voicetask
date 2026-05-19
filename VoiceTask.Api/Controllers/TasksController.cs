using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Common;
using VoiceTask.Domain.DTOs.Tasks;

namespace VoiceTask.Api.Controllers;

[Authorize]
public class TasksController(ITaskService taskService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<TaskResponse>>> GetTasks(
        [FromQuery] TaskFilterParams filters, CancellationToken ct) =>
        Ok(await taskService.GetTasksAsync(CurrentUserId, CurrentUserRole, filters, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskDetailResponse>> GetTask(Guid id, CancellationToken ct) =>
        Ok(await taskService.GetTaskByIdAsync(id, CurrentUserId, CurrentUserRole, ct));

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask(
        [FromBody] CreateTaskRequest request, CancellationToken ct)
    {
        var created = await taskService.CreateTaskAsync(request, CurrentUserId, ct);
        return CreatedAtAction(nameof(GetTask), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> UpdateTask(
        Guid id, [FromBody] UpdateTaskRequest request, CancellationToken ct) =>
        Ok(await taskService.UpdateTaskAsync(id, request, CurrentUserId, CurrentUserRole, ct));

    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<TaskResponse>> PatchTask(
        Guid id, [FromBody] PatchTaskRequest request, CancellationToken ct) =>
        Ok(await taskService.PatchTaskAsync(id, request, CurrentUserId, CurrentUserRole, ct));

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteTask(Guid id, CancellationToken ct)
    {
        await taskService.DeleteTaskAsync(id, CurrentUserId, CurrentUserRole, ct);
        return NoContent();
    }

    [HttpGet("unacknowledged")]
    public async Task<ActionResult<List<TaskResponse>>> GetUnacknowledged(CancellationToken ct) =>
        Ok(await taskService.GetUnacknowledgedAsync(CurrentUserId, ct));

    [HttpPost("{id:guid}/acknowledge")]
    public async Task<IActionResult> Acknowledge(Guid id, CancellationToken ct)
    {
        await taskService.AcknowledgeAsync(id, CurrentUserId, ct);
        return NoContent();
    }

    [HttpGet("{id:guid}/subtasks")]
    public async Task<ActionResult<List<TaskResponse>>> GetSubTasks(Guid id, CancellationToken ct) =>
        Ok(await taskService.GetSubTasksAsync(id, CurrentUserId, CurrentUserRole, ct));
}
