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
        "The transcript may contain repeated or stuttered words due to speech recognition — " +
        "ignore duplications and extract the intended meaning. " +
        "Return ONLY the raw JSON array with no markdown fences, explanation, or other text.";

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
            messages = new object[]
            {
                new { role = "user", content = $"Extract tasks from this transcript:\n\n{transcript}" },
                // Prefill the assistant turn so Claude is forced to start with '[' — prevents
                // markdown code fences (```json) appearing before the array.
                new { role = "assistant", content = "[" }
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

        // The prefilled "[" is not included in the response text — Claude continues from it.
        var rawText = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? "]";

        var text = NormalizeJson("[" + rawText);

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

    /// <summary>
    /// Strips markdown code fences that Claude occasionally emits despite instructions.
    /// Handles both the prefill path ("[ ... ]") and the rare fallback where fences appear.
    /// </summary>
    private static string NormalizeJson(string raw)
    {
        var s = raw.Trim();

        // Strip leading ```json or ``` fence
        if (s.StartsWith("```"))
        {
            var firstNewline = s.IndexOf('\n');
            s = firstNewline >= 0 ? s[(firstNewline + 1)..] : s[3..];
        }

        // Strip trailing ``` fence
        if (s.EndsWith("```"))
            s = s[..^3];

        return s.Trim();
    }
}
