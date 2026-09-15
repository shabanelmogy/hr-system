using System.Buffers;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.Platform.Infrastructure.Files;

/// <summary>
/// Provider-neutral upload gate. It validates the declared type against the
/// extension and a bounded content signature, then optionally runs ClamAV
/// before the application layer can write a binary or metadata row.
/// </summary>
public sealed class FileUploadInspectionService(
    IOptions<FileSecurityOptions> options,
    IFileMalwareScanner malwareScanner,
    ILogger<FileUploadInspectionService> logger) : IFileUploadInspectionService
{
    private readonly FileSecurityOptions _options = options.Value;

    public async Task InspectAsync(
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(upload);

        if (upload.Length <= 0 || upload.Length > _options.MaxScanBytes)
            ThrowInvalid("FileSizeInvalid");

        var extension = NormalizeExtension(upload.FileName);
        var contentType = NormalizeContentType(upload.ContentType);

        if (!ContentTypesByExtension.TryGetValue(extension, out var allowedContentTypes) ||
            !allowedContentTypes.Contains(contentType))
        {
            ThrowInvalid("FileContentTypeMismatch");
        }

        var header = await ReadHeaderAsync(upload, cancellationToken).ConfigureAwait(false);
        ValidateSignature(extension, contentType, header.Bytes, header.ReachedEndOfStream);

        if (!_options.MalwareScanningEnabled)
            return;

        var verdict = await malwareScanner.ScanAsync(upload, cancellationToken).ConfigureAwait(false);
        switch (verdict)
        {
            case FileMalwareScanStatus.Clean:
                return;
            case FileMalwareScanStatus.MalwareDetected:
                ThrowMalware();
                return;
            default:
                logger.LogWarning("File malware scanner did not return a trusted verdict.");
                ThrowScannerUnavailable();
                return;
        }
    }

    private async Task<(byte[] Bytes, bool ReachedEndOfStream)> ReadHeaderAsync(
        PlatformFileUpload upload,
        CancellationToken cancellationToken)
    {
        await using var stream = upload.OpenReadStream();
        // Read one probe byte beyond the policy limit.  Without the probe, a
        // file whose length is exactly the limit would look like a truncated
        // header and an incomplete final UTF-8 code point could be accepted.
        var header = ArrayPool<byte>.Shared.Rent(_options.HeaderReadLimitBytes + 1);
        try
        {
            var read = 0;
            var reachedEndOfStream = false;
            while (read < _options.HeaderReadLimitBytes + 1)
            {
                var count = await stream.ReadAsync(
                        header.AsMemory(read, _options.HeaderReadLimitBytes + 1 - read),
                        cancellationToken)
                    .ConfigureAwait(false);
                if (count == 0)
                {
                    reachedEndOfStream = true;
                    break;
                }
                read += count;
            }

            if (read == 0)
                ThrowInvalid("FileContentEmpty");

            var headerLength = Math.Min(read, _options.HeaderReadLimitBytes);
            return (header[..headerLength].ToArray(), reachedEndOfStream);
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(header);
        }
    }

    private static void ValidateSignature(
        string extension,
        string contentType,
        byte[] header,
        bool reachedEndOfStream)
    {
        if (StartsWith(header, "MZ"u8) ||
            StartsWith(header, [0x7F, 0x45, 0x4C, 0x46]) ||
            StartsWith(header, "#!"u8) ||
            StartsWithMachO(header))
        {
            ThrowInvalid("ExecutableContentNotAllowed");
        }

        var valid = extension switch
        {
            ".jpg" or ".jpeg" => StartsWith(header, [0xFF, 0xD8, 0xFF]),
            ".png" => StartsWith(header, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
            ".gif" => StartsWithAscii(header, "GIF87a") || StartsWithAscii(header, "GIF89a"),
            ".bmp" => StartsWithAscii(header, "BM"),
            ".webp" => IsWebp(header),
            ".mp4" => IsIsoBaseMedia(header, "mp4"),
            ".mov" or ".qt" => IsQuickTime(header),
            ".webm" => StartsWith(header, [0x1A, 0x45, 0xDF, 0xA3]),
            ".avi" => IsAvi(header),
            ".pdf" => StartsWithAscii(header, "%PDF-"),
            ".doc" or ".xls" or ".rpt" => StartsWith(header, [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]),
            ".docx" or ".xlsx" or ".zip" => IsZip(header),
            ".mp3" => StartsWithAscii(header, "ID3") || LooksLikeMpegFrame(header),
            ".wav" => IsWave(header),
            ".ogg" => StartsWithAscii(header, "OggS"),
            ".rar" => IsRar(header),
            ".txt" or ".csv" => IsSafeText(header, reachedEndOfStream),
            _ => false
        };

        if (!valid)
            ThrowInvalid("FileContentSignatureMismatch");

        // A text content type must never be paired with a binary signature,
        // even if a caller supplied a text-looking extension.
        if ((contentType is "text/plain" or "text/csv") && !IsSafeText(header, reachedEndOfStream))
            ThrowInvalid("TextContentNotAllowed");
    }

    private static string NormalizeExtension(string fileName)
    {
        if (string.IsNullOrWhiteSpace(fileName))
            ThrowInvalid("FileNameInvalid");

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
            ThrowInvalid("FileExtensionNotAllowed");

        return extension;
    }

    private static string NormalizeContentType(string contentType)
    {
        var normalized = (contentType ?? string.Empty).Split(';', 2)[0].Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(normalized))
            ThrowInvalid("FileContentTypeMissing");
        return normalized;
    }

    private static bool StartsWith(byte[] value, ReadOnlySpan<byte> prefix) =>
        value.AsSpan().StartsWith(prefix);

    private static bool StartsWithAscii(byte[] value, string prefix) =>
        StartsWith(value, Encoding.ASCII.GetBytes(prefix));

    private static bool IsWebp(byte[] value) =>
        value.Length >= 12 && StartsWithAscii(value, "RIFF") &&
        value.AsSpan(8).StartsWith("WEBP"u8);

    private static bool IsIsoBaseMedia(byte[] value, string brand)
    {
        if (value.Length < 12 || !value.AsSpan(4).StartsWith("ftyp"u8))
            return false;

        var brands = Encoding.ASCII.GetString(value, 8, Math.Min(value.Length - 8, 64));
        return brands.Contains(brand, StringComparison.OrdinalIgnoreCase) ||
            brands.Contains("isom", StringComparison.OrdinalIgnoreCase) ||
            brands.Contains("iso2", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsQuickTime(byte[] value)
    {
        if (value.Length < 12 || !value.AsSpan(4).StartsWith("ftyp"u8))
            return false;

        var brands = Encoding.ASCII.GetString(value, 8, Math.Min(value.Length - 8, 64));
        return brands.Contains("qt", StringComparison.OrdinalIgnoreCase);
    }

    private static bool IsAvi(byte[] value) =>
        value.Length >= 12 && StartsWithAscii(value, "RIFF") && value.AsSpan(8).StartsWith("AVI "u8);

    private static bool IsWave(byte[] value) =>
        value.Length >= 12 && StartsWithAscii(value, "RIFF") && value.AsSpan(8).StartsWith("WAVE"u8);

    private static bool IsZip(byte[] value) =>
        StartsWith(value, [0x50, 0x4B, 0x03, 0x04]) ||
        StartsWith(value, [0x50, 0x4B, 0x05, 0x06]) ||
        StartsWith(value, [0x50, 0x4B, 0x07, 0x08]);

    private static bool IsRar(byte[] value) =>
        StartsWith(value, [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00]) ||
        StartsWith(value, [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x01, 0x00]);

    private static bool LooksLikeMpegFrame(byte[] value) =>
        value.Length >= 2 && value[0] == 0xFF && (value[1] & 0xE0) == 0xE0;

    private static bool IsSafeText(byte[] value, bool reachedEndOfStream)
    {
        if (value.Contains((byte)0))
            return false;

        try
        {
            var decoder = new UTF8Encoding(encoderShouldEmitUTF8Identifier: false, throwOnInvalidBytes: true)
                .GetDecoder();
            var characters = new char[value.Length];
            decoder.Convert(value, 0, value.Length, characters, 0, characters.Length, flush: reachedEndOfStream,
                out _, out var charsUsed, out _);
            return characters.AsSpan(0, charsUsed).ToArray().All(character =>
                character is '\r' or '\n' or '\t' || !char.IsControl(character));
        }
        catch (DecoderFallbackException)
        {
            return false;
        }
    }

    private static bool StartsWithMachO(byte[] value) =>
        StartsWith(value, [0xFE, 0xED, 0xFA, 0xCE]) ||
        StartsWith(value, [0xCE, 0xFA, 0xED, 0xFE]) ||
        StartsWith(value, [0xFE, 0xED, 0xFA, 0xCF]) ||
        StartsWith(value, [0xCF, 0xFA, 0xED, 0xFE]);

    private static readonly IReadOnlyDictionary<string, IReadOnlySet<string>> ContentTypesByExtension =
        new Dictionary<string, IReadOnlySet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = new HashSet<string>(["image/jpeg", "image/jpg"], StringComparer.OrdinalIgnoreCase),
            [".jpeg"] = new HashSet<string>(["image/jpeg", "image/jpg"], StringComparer.OrdinalIgnoreCase),
            [".png"] = new HashSet<string>(["image/png"], StringComparer.OrdinalIgnoreCase),
            [".gif"] = new HashSet<string>(["image/gif"], StringComparer.OrdinalIgnoreCase),
            [".bmp"] = new HashSet<string>(["image/bmp", "image/x-ms-bmp"], StringComparer.OrdinalIgnoreCase),
            [".webp"] = new HashSet<string>(["image/webp"], StringComparer.OrdinalIgnoreCase),
            [".mp4"] = new HashSet<string>(["video/mp4"], StringComparer.OrdinalIgnoreCase),
            [".webm"] = new HashSet<string>(["video/webm"], StringComparer.OrdinalIgnoreCase),
            [".mov"] = new HashSet<string>(["video/quicktime"], StringComparer.OrdinalIgnoreCase),
            [".qt"] = new HashSet<string>(["video/quicktime"], StringComparer.OrdinalIgnoreCase),
            [".avi"] = new HashSet<string>(["video/x-msvideo", "video/avi"], StringComparer.OrdinalIgnoreCase),
            [".pdf"] = new HashSet<string>(["application/pdf"], StringComparer.OrdinalIgnoreCase),
            [".doc"] = new HashSet<string>(["application/msword"], StringComparer.OrdinalIgnoreCase),
            [".xls"] = new HashSet<string>(["application/vnd.ms-excel"], StringComparer.OrdinalIgnoreCase),
            [".rpt"] = new HashSet<string>(["application/octet-stream"], StringComparer.OrdinalIgnoreCase),
            [".docx"] = new HashSet<string>(["application/vnd.openxmlformats-officedocument.wordprocessingml.document"], StringComparer.OrdinalIgnoreCase),
            [".xlsx"] = new HashSet<string>(["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"], StringComparer.OrdinalIgnoreCase),
            [".zip"] = new HashSet<string>(["application/zip", "application/x-zip-compressed"], StringComparer.OrdinalIgnoreCase),
            [".mp3"] = new HashSet<string>(["audio/mpeg", "audio/mp3"], StringComparer.OrdinalIgnoreCase),
            [".wav"] = new HashSet<string>(["audio/wav", "audio/x-wav"], StringComparer.OrdinalIgnoreCase),
            [".ogg"] = new HashSet<string>(["audio/ogg", "application/ogg"], StringComparer.OrdinalIgnoreCase),
            [".rar"] = new HashSet<string>(["application/x-rar-compressed", "application/vnd.rar", "application/x-rar"], StringComparer.OrdinalIgnoreCase),
            [".txt"] = new HashSet<string>(["text/plain"], StringComparer.OrdinalIgnoreCase),
            [".csv"] = new HashSet<string>(["text/csv", "text/plain", "application/csv"], StringComparer.OrdinalIgnoreCase)
        };

    private static void ThrowInvalid(string code) =>
        throw new FileUploadSecurityException(
            FileUploadSecurityFailureKind.InvalidContent,
            code,
            code);

    private static void ThrowMalware() =>
        throw new FileUploadSecurityException(
            FileUploadSecurityFailureKind.MalwareDetected,
            "FileMalwareDetected",
            "The malware scanner identified a malicious upload.");

    private static void ThrowScannerUnavailable() =>
        throw new FileUploadSecurityException(
            FileUploadSecurityFailureKind.ScannerUnavailable,
            "FileScannerUnavailable",
            "The malware scanner did not provide a trusted verdict.");
}
