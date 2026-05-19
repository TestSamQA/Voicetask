using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Voice;

namespace VoiceTask.App.Services.Voice;

public class TaskExtractionService(
    IHttpClientFactory httpClientFactory,
    IConfiguration config,
    ILogger<TaskExtractionService> logger) : ITaskExtractionService
{
    private const string Model = "claude-sonnet-4-20250514";
    private const int MaxTokens = 3000;

    private const string SystemPrompt =
        "You are a task extraction assistant. Given a voice transcript, extract all tasks mentioned " +
        "and return them as a JSON array. Each task object must have: title (string, required), " +
        "description (string or null), priority (\"Low\"|\"Medium\"|\"High\"|\"Critical\"), " +
        "dueDate (ISO date string YYYY-MM-DD or null), labels (string array), " +
        "subtasks (array of {title, description, priority, dueDate, labels}). " +
        "Return ONLY the JSON array, no additional text.";

    public async Task<List<ParsedTaskTree>> ExtractAsync(string transcript, CancellationToken ct = default)
    {
        var client = httpClientFactory.CreateClient("Claude");
        var apiKey = config["Anthropic:ApiKey"]
            ?? throw new InvalidOperationException("Anthropic:ApiKey is not configured.");

        var payload = new
        {
            model = Model,
            max_tokens = MaxTokens,
            temperature = 0.2,
            system = SystemPrompt,
            messages = new[]
            {
                new { role = "user", content = $"Extract tasks from this transcript:\n\n{transcript}" }
            }
        };

        var body = JsonSerializer.Serialize(payload);
        using var request = new HttpRequestMessage(HttpMethod.Post, "messages");
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(body, Encoding.UTF8, "application/json");

        var sw = Stopwatch.StartNew();
        using var response = await client.SendAsync(request, ct);
        sw.Stop();

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync(ct);
            logger.LogError("Claude API error {Status}: {Body}", response.StatusCode, err);
            throw new InvalidOperationException($"Task extraction failed: {response.StatusCode}");
        }

        var json = await response.Content.ReadAsStringAsync(ct);
        using var doc = JsonDocument.Parse(json);

        var text = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? "[]";

        List<ParsedTaskTree> parsed;
        try
        {
            parsed = JsonSerializer.Deserialize<List<ParsedTaskTree>>(text,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }) ?? [];
        }
        catch (JsonException ex)
        {
            logger.LogError(ex, "Failed to parse Claude response as task list. Raw: {Raw}", text);
            parsed = [];
        }

        logger.LogInformation(
            "Claude extraction completed in {Ms}ms, extracted {Count} tasks",
            sw.ElapsedMilliseconds, parsed.Count);

        return parsed;
    }
}
