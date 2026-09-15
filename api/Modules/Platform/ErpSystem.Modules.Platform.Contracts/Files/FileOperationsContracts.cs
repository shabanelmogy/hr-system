namespace ErpSystem.Modules.Platform.Contracts.Files;

public sealed class PlatformFileUpload(
    string fileName,
    string contentType,
    long length,
    Func<Stream> openReadStream)
{
    public string FileName { get; } = fileName;
    public string ContentType { get; } = contentType;
    public long Length { get; } = length;
    public Stream OpenReadStream() => openReadStream();
}
