using System.Text.Json;
using Microsoft.Extensions.Logging;
using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Voice;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Enums;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Voice;

public class VoiceService(
    ITaskExtractionService extractor,
    IVoiceCaptureRepository captures,
    ITaskRepository tasks,
    ILabelRepository labels,
    ILogger<VoiceService> logger) : IVoiceService
{
    public async Task<VoiceCaptureResponse> ExtractAsync(
        string transcript, Guid userId, CancellationToken ct = default)
    {
        List<ParsedTaskTree> parsed;
        try
        {
            parsed = await extractor.ExtractAsync(transcript, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Task extraction failed for user {UserId}", userId);
            throw;
        }

        var capture = new VoiceCapture
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AudioPath = string.Empty,
            Transcript = transcript,
            RawAiResponse = JsonSerializer.Serialize(parsed),
            TaskCount = parsed.Count,
            CreatedAt = DateTime.UtcNow,
        };

        await captures.AddAsync(capture, ct);
        await captures.SaveChangesAsync(ct);

        return new VoiceCaptureResponse(capture.Id, transcript, parsed);
    }

    public async Task<List<Guid>> ConfirmAsync(
        ConfirmVoiceRequest request, Guid userId, CancellationToken ct = default)
    {
        var capture = await captures.GetByIdAsync(request.CaptureId, ct)
            ?? throw new NotFoundException("VoiceCapture", request.CaptureId);

        if (capture.UserId != userId)
            throw new ForbiddenException("This voice capture does not belong to you.");

        var allLabelIds = request.Tasks
            .SelectMany(t => t.LabelIds)
            .Distinct()
            .ToList();

        var resolvedLabels = allLabelIds.Count > 0
            ? await labels.GetByIdsAsync(allLabelIds, ct)
            : [];

        var labelMap = resolvedLabels.ToDictionary(l => l.Id);
        Label[] ResolveLabels(IEnumerable<Guid> ids) =>
            ids.Select(id => labelMap.TryGetValue(id, out var l) ? l : null)
               .OfType<Label>()
               .ToArray();

        var tasksToAdd = new List<TaskItem>();
        var taskIds = new List<Guid>();

        foreach (var dto in request.Tasks)
        {
            var taskId = Guid.NewGuid();
            var now = DateTime.UtcNow;
            var task = new TaskItem
            {
                Id = taskId,
                Title = dto.Title,
                Description = dto.Description,
                Priority = (Priority)Math.Clamp(dto.Priority, 0, 3),
                Status = Domain.Enums.TaskStatus.ToDo,
                DueDate = ParseDate(dto.DueDate),
                CreatedById = userId,
                AssigneeId = dto.AssigneeId,
                CreatedAt = now,
                UpdatedAt = now,
                Labels = ResolveLabels(dto.LabelIds),
            };

            foreach (var sub in dto.SubTasks)
            {
                task.SubTasks.Add(new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = sub.Title,
                    Priority = (Priority)Math.Clamp(dto.Priority, 0, 3),
                    Status = Domain.Enums.TaskStatus.ToDo,
                    CreatedById = userId,
                    ParentTaskId = taskId,
                    CreatedAt = now,
                    UpdatedAt = now,
                });
            }

            tasksToAdd.Add(task);
            taskIds.Add(taskId);
        }

        await tasks.AddRangeAsync(tasksToAdd, ct);
        await tasks.SaveChangesAsync(ct);

        logger.LogInformation(
            "Confirmed voice capture {CaptureId}: created {Count} tasks for user {UserId}",
            request.CaptureId, taskIds.Count, userId);

        return taskIds;
    }

    private static DateOnly? ParseDate(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return DateOnly.TryParse(value, out var date) ? date : null;
    }
}
