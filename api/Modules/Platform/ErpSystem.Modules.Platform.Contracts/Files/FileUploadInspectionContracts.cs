namespace ErpSystem.Modules.Platform.Contracts.Files;

/// <summary>
/// The safe categories that can be returned to an HTTP client when an upload
/// does not pass the platform security gate. Scanner details are deliberately
/// not exposed through this model.
/// </summary>
public enum FileUploadSecurityFailureKind
{
    InvalidContent = 1,
    MalwareDetected = 2,
    ScannerUnavailable = 3
}

/// <summary>
/// Raised by the platform file workflow before a binary or metadata record is
/// persisted. The code and category are stable; the exception message is for
/// internal diagnostics only and must not be sent to clients.
/// </summary>
public sealed class FileUploadSecurityException : Exception
{
    public FileUploadSecurityException(
        FileUploadSecurityFailureKind failureKind,
        string code,
        string? internalMessage = null,
        Exception? innerException = null)
        : base(internalMessage ?? code, innerException)
    {
        FailureKind = failureKind;
        Code = code;
    }

    public FileUploadSecurityFailureKind FailureKind { get; }

    public string Code { get; }
}

public interface IFileUploadInspectionService
{
    Task InspectAsync(
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default);
}
