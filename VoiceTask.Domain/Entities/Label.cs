namespace VoiceTask.Domain.Entities;

public class Label
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;   // unique
    public string Colour { get; set; } = null!;  // hex e.g. "#3B82F6"

    public ICollection<TaskItem> Tasks { get; set; } = [];
}
