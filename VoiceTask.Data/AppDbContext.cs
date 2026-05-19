using Microsoft.EntityFrameworkCore;
using VoiceTask.Domain.Entities;

namespace VoiceTask.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<TaskItem> Tasks => Set<TaskItem>();
    public DbSet<Label> Labels => Set<Label>();
    public DbSet<VoiceCapture> VoiceCaptures => Set<VoiceCapture>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<TaskItem>()
          .HasOne(t => t.CreatedBy).WithMany(u => u.CreatedTasks)
          .HasForeignKey(t => t.CreatedById).OnDelete(DeleteBehavior.Restrict);

        mb.Entity<TaskItem>()
          .HasOne(t => t.Assignee).WithMany(u => u.AssignedTasks)
          .HasForeignKey(t => t.AssigneeId).OnDelete(DeleteBehavior.SetNull);

        mb.Entity<TaskItem>()
          .HasOne(t => t.ParentTask).WithMany(t => t.SubTasks)
          .HasForeignKey(t => t.ParentTaskId).OnDelete(DeleteBehavior.Restrict);

        mb.Entity<TaskItem>()
          .HasMany(t => t.Labels).WithMany(l => l.Tasks)
          .UsingEntity("TaskLabels");

        mb.Entity<Notification>()
          .HasOne(n => n.Recipient).WithMany(u => u.ReceivedNotifications)
          .HasForeignKey(n => n.RecipientId).OnDelete(DeleteBehavior.Cascade);

        mb.Entity<Notification>()
          .HasOne(n => n.Task).WithMany(t => t.Notifications)
          .HasForeignKey(n => n.TaskId).OnDelete(DeleteBehavior.SetNull);

        // Global soft-delete filter — bypassed only with IgnoreQueryFilters()
        mb.Entity<TaskItem>().HasQueryFilter(t => !t.IsDeleted);

        // Unique indices
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();
        mb.Entity<User>().HasIndex(u => u.Username).IsUnique();
        mb.Entity<Label>().HasIndex(l => l.Name).IsUnique();

        // Composite index: dashboard unacknowledged query
        mb.Entity<TaskItem>()
          .HasIndex(t => new { t.AssigneeId, t.AssignmentAcknowledgedAt });

        // Composite index: unread notification queries
        mb.Entity<Notification>()
          .HasIndex(n => new { n.RecipientId, n.IsRead });
    }
}
