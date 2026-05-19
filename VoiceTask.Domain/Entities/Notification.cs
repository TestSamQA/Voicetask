namespace VoiceTask.Domain.Entities;

public class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientId { get; set; }
    public User Recipient { get; set; } = null!;
    public Guid? ActorId { get; set; }    // user who triggered the event
    public Guid? TaskId { get; set; }
    public TaskItem? Task { get; set; }
    public string Message { get; set; } = null!;
    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; }
}
