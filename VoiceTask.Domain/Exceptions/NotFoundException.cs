namespace VoiceTask.Domain.Exceptions;

public class NotFoundException : AppException
{
    public NotFoundException(string resource, object id)
        : base($"{resource} with id '{id}' was not found.", 404) { }

    public NotFoundException(string message)
        : base(message, 404) { }
}
