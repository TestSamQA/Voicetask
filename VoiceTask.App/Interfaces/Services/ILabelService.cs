using VoiceTask.Domain.DTOs.Labels;

namespace VoiceTask.App.Interfaces.Services;

public interface ILabelService
{
    Task<List<LabelResponse>> GetAllAsync(CancellationToken ct = default);
    Task<LabelResponse> CreateAsync(CreateLabelRequest request, CancellationToken ct = default);
    Task DeleteAsync(Guid id, CancellationToken ct = default);
}
