using VoiceTask.Domain.Interfaces.Repositories;

namespace VoiceTask.Api.BackgroundServices;

public class NotificationCleanupService(
    IServiceScopeFactory scopeFactory,
    ILogger<NotificationCleanupService> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromDays(1);
    private const int RetentionDays = 30;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(Interval, stoppingToken);

            try
            {
                using var scope = scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
                var cutoff = DateTime.UtcNow.AddDays(-RetentionDays);
                await repo.DeleteOlderThanAsync(cutoff, stoppingToken);
                logger.LogInformation("Notification cleanup: deleted notifications older than {Cutoff:u}", cutoff);
            }
            catch (OperationCanceledException) { /* shutting down */ }
            catch (Exception ex)
            {
                logger.LogError(ex, "Notification cleanup failed");
            }
        }
    }
}
