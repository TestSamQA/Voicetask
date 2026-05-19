using VoiceTask.Domain.Interfaces.Repositories;
using VoiceTask.App.Interfaces.Services;
using VoiceTask.Domain.DTOs.Labels;
using VoiceTask.Domain.Entities;
using VoiceTask.Domain.Exceptions;

namespace VoiceTask.App.Services.Labels;

public class LabelService(ILabelRepository labels) : ILabelService
{
    public async Task<List<LabelResponse>> GetAllAsync(CancellationToken ct = default)
    {
        var all = await labels.GetAllAsync(ct);
        return all.Select(l => new LabelResponse(l.Id, l.Name, l.Colour)).ToList();
    }

    public async Task<LabelResponse> CreateAsync(CreateLabelRequest request, CancellationToken ct = default)
    {
        var existing = await labels.GetByNameAsync(request.Name, ct);
        if (existing is not null)
            throw new ConflictException($"A label named '{request.Name}' already exists.");

        var label = new Label
        {
            Id = Guid.NewGuid(),
            Name = request.Name.ToLower(),
            Colour = request.Colour,
        };

        await labels.AddAsync(label, ct);
        await labels.SaveChangesAsync(ct);

        return new LabelResponse(label.Id, label.Name, label.Colour);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var label = await labels.GetByIdAsync(id, ct)
            ?? throw new NotFoundException("Label", id);

        await labels.RemoveAsync(label, ct);
        await labels.SaveChangesAsync(ct);
    }
}
