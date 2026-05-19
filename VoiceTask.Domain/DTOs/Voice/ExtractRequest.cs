using System.ComponentModel.DataAnnotations;

namespace VoiceTask.Domain.DTOs.Voice;

public record ExtractRequest([Required] string Transcript);
