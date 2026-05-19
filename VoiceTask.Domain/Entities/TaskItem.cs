using VoiceTask.Domain.Enums;

namespace VoiceTask.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public Priority Priority { get; set; } = Priority.Medium;
    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.ToDo;
    public DateOnly? DueDate { get; set; }
    public bool IsDeleted { get; set; } = false;
    public DateTime? AssignmentAcknowledgedAt { get; set; } // null = unacknowledged

    public Guid CreatedById { get; set; }
    public User CreatedBy { get; set; } = null!;

    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public Guid? ParentTaskId { get; set; }
    public TaskItem? ParentTask { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<TaskItem> SubTasks { get; set; } = [];
    public ICollection<Label> Labels { get; set; } = [];
    public ICollection<Notification> Notifications { get; set; } = [];
}
