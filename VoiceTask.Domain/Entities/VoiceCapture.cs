namespace VoiceTask.Domain.Entities;

public class VoiceCapture
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string AudioPath { get; set; } = null!;
    public string Transcript { get; set; } = null!;
    public string RawAiResponse { get; set; } = null!;
    public int TaskCount { get; set; } // number of parent tasks parsed
    public DateTime CreatedAt { get; set; }
}
