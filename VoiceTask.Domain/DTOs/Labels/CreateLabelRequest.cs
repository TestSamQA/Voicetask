using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace VoiceTask.Domain.DTOs.Labels;

public record CreateLabelRequest(
    [Required, StringLength(50, MinimumLength = 1)] string Name,
    [Required, RegularExpression(@"^#[0-9A-Fa-f]{6}$", ErrorMessage = "Colour must be a valid hex colour e.g. #3B82F6")]
    string Colour
);
