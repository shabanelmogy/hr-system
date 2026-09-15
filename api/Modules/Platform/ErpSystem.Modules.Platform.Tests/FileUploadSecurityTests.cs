using System.Net;
using System.Net.Sockets;
using System.Text;
using ErpSystem.Modules.Platform.Application;
using ErpSystem.Modules.Platform.Application.Files;
using ErpSystem.Modules.Platform.Contracts.Files;
using ErpSystem.Modules.Platform.Infrastructure.Files;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MediatR;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class FileUploadSecurityTests
{
    [Theory]
    [InlineData("document.pdf", "application/pdf", "%PDF-1.7\n")]
    [InlineData("archive.zip", "application/zip", "PK\x03\x04")]
    [InlineData("notes.txt", "text/plain", "plain text\r\n")]
    public async Task Inspector_AllowsRepresentativeSupportedContent(
        string fileName,
        string contentType,
        string content)
    {
        var inspector = CreateInspector(scanningEnabled: false);

        await inspector.InspectAsync(Upload(fileName, contentType, Encoding.UTF8.GetBytes(content)));
    }

    [Fact]
    public async Task Inspector_AllowsRepresentativePng()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        byte[] png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];

        await inspector.InspectAsync(Upload("image.png", "image/png", png));
    }

    [Fact]
    public async Task Inspector_AllowsLegacyOleDocument()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        byte[] ole = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00];

        await inspector.InspectAsync(Upload("legacy.doc", "application/msword", ole));
    }

    [Fact]
    public async Task Inspector_AllowsCrystalReportOlePayload()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        byte[] ole = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00];

        await inspector.InspectAsync(Upload("report.rpt", "application/octet-stream", ole));
    }

    [Theory]
    [InlineData("image.png", "application/pdf", "%PDF-1.7")]
    [InlineData("notes.txt", "text/plain", "MZ\x90\x00")]
    [InlineData("vector.svg", "image/svg+xml", "<svg></svg>")]
    public async Task Inspector_RejectsMismatchedExecutableAndDisallowedContent(
        string fileName,
        string contentType,
        string content)
    {
        var inspector = CreateInspector(scanningEnabled: false);

        var exception = await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            inspector.InspectAsync(Upload(fileName, contentType, Encoding.UTF8.GetBytes(content))));

        Assert.Equal(FileUploadSecurityFailureKind.InvalidContent, exception.FailureKind);
    }

    [Fact]
    public async Task Inspector_FailsClosedWhenMalwareScannerIsUnavailable()
    {
        var inspector = CreateInspector(
            scanningEnabled: true,
            scanner: new FakeScanner(FileMalwareScanStatus.Unavailable));

        var exception = await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            inspector.InspectAsync(Upload("document.pdf", "application/pdf", Encoding.ASCII.GetBytes("%PDF-1.7"))));

        Assert.Equal(FileUploadSecurityFailureKind.ScannerUnavailable, exception.FailureKind);
        Assert.Equal("FileScannerUnavailable", exception.Code);
    }

    [Fact]
    public async Task Inspector_RejectsMalwareWithoutExposingScannerDetails()
    {
        var inspector = CreateInspector(
            scanningEnabled: true,
            scanner: new FakeScanner(FileMalwareScanStatus.MalwareDetected));

        var exception = await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            inspector.InspectAsync(Upload("document.pdf", "application/pdf", Encoding.ASCII.GetBytes("%PDF-1.7"))));

        Assert.Equal(FileUploadSecurityFailureKind.MalwareDetected, exception.FailureKind);
        Assert.Equal("FileMalwareDetected", exception.Code);
        Assert.DoesNotContain("Eicar", exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Theory]
    [InlineData("stream: OK\0", FileMalwareScanStatus.Clean)]
    [InlineData("stream: Eicar-Test-Signature FOUND\0", FileMalwareScanStatus.MalwareDetected)]
    [InlineData("stream: NOT OK\0", FileMalwareScanStatus.Unavailable)]
    [InlineData("OK\0", FileMalwareScanStatus.Unavailable)]
    [InlineData("stream: OK\n", FileMalwareScanStatus.Unavailable)]
    [InlineData("unexpected response\0", FileMalwareScanStatus.Unavailable)]
    public async Task ClamAvClient_ParsesBoundedResponses(
        string response,
        FileMalwareScanStatus expected)
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        var scanner = new ClamAvTcpClient(Options.Create(new FileSecurityOptions
        {
            MalwareScanningEnabled = true,
            ScannerHost = "127.0.0.1",
            ScannerPort = port,
            ScannerTimeoutSeconds = 5
        }));

        var scanTask = scanner.ScanAsync(Upload("notes.txt", "text/plain", Encoding.UTF8.GetBytes("hello")));
        using var server = await listener.AcceptTcpClientAsync();
        await using var network = server.GetStream();
        await ReadUntilEndOfStreamFrameAsync(network);
        await network.WriteAsync(Encoding.ASCII.GetBytes(response));
        await network.FlushAsync();

        Assert.Equal(expected, await scanTask);
    }

    [Fact]
    public async Task ClamAvClient_RejectsTruncatedResponseWithoutTerminator()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var scanner = CreateScanner(listener);

        var scanTask = scanner.ScanAsync(Upload("notes.txt", "text/plain", Encoding.UTF8.GetBytes("hello")));
        using var server = await listener.AcceptTcpClientAsync();
        await using var network = server.GetStream();
        await ReadUntilEndOfStreamFrameAsync(network);
        await network.WriteAsync("stream: OK"u8.ToArray());
        await network.FlushAsync();
        server.Close();

        Assert.Equal(FileMalwareScanStatus.Unavailable, await scanTask);
    }

    [Fact]
    public async Task ClamAvClient_RejectsResponseBeyondConfiguredBound()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var scanner = new ClamAvTcpClient(Options.Create(new FileSecurityOptions
        {
            ScannerHost = "127.0.0.1",
            ScannerPort = ((IPEndPoint)listener.LocalEndpoint).Port,
            ScannerMaxResponseBytes = 64,
            ScannerTimeoutSeconds = 2
        }));
        var scan = scanner.ScanAsync(Upload("notes.txt", "text/plain", "hello"u8.ToArray()));
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        using var server = await listener.AcceptTcpClientAsync(timeout.Token);
        await using var network = server.GetStream();
        await ReadUntilEndOfStreamFrameAsync(network);
        await network.WriteAsync(Encoding.ASCII.GetBytes(new string('x', 80) + "stream: OK\0"), timeout.Token);
        Assert.Equal(FileMalwareScanStatus.Unavailable, await scan);
    }

    [Fact]
    public async Task ClamAvClient_RejectsDeclaredLengthMismatch()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var scanner = CreateScanner(listener);
        var bytes = Encoding.UTF8.GetBytes("hello");
        var upload = new PlatformFileUpload(
            "notes.txt",
            "text/plain",
            bytes.Length + 1,
            () => new MemoryStream(bytes, writable: false));

        var scanTask = scanner.ScanAsync(upload);
        using var server = await listener.AcceptTcpClientAsync();
        await using var network = server.GetStream();
        var command = new byte[10];
        await network.ReadExactlyAsync(command);
        var length = new byte[4];
        await network.ReadExactlyAsync(length);
        var chunkSize = System.Buffers.Binary.BinaryPrimitives.ReadInt32BigEndian(length);
        await network.ReadExactlyAsync(new byte[chunkSize]);

        Assert.Equal(FileMalwareScanStatus.Unavailable, await scanTask);
    }

    [Fact]
    public async Task Inspector_AllowsArabicTextWhenSampleEndsInsideUtf8Character()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        var content = Encoding.UTF8.GetBytes(new string('a', 65_535) + "ا\n");

        await inspector.InspectAsync(Upload("notes.txt", "text/plain", content));
    }

    [Theory]
    [InlineData("ا", 1)]
    [InlineData("€", 1)]
    [InlineData("€", 2)]
    [InlineData("😀", 1)]
    [InlineData("😀", 2)]
    [InlineData("😀", 3)]
    public async Task Inspector_PreservesUtf8PrefixAcrossShortReads(string character, int bytesInsideSample)
    {
        var content = Encoding.UTF8.GetBytes(new string('a', 512 - bytesInsideSample) + character + "end");
        var inspector = new FileUploadInspectionService(
            Options.Create(new FileSecurityOptions { HeaderReadLimitBytes = 512 }),
            new FakeScanner(FileMalwareScanStatus.Clean),
            NullLogger<FileUploadInspectionService>.Instance);
        await inspector.InspectAsync(new PlatformFileUpload(
            "notes.txt", "text/plain", content.Length, () => new ShortReadStream(content)));
    }

    [Theory]
    [InlineData("stream: OK \0")]
    [InlineData("stream: OK\r\n")]
    public async Task ClamAvClient_RejectsMalformedSuffix(string response)
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var scanner = CreateScanner(listener);
        var scan = scanner.ScanAsync(Upload("notes.txt", "text/plain", "hello"u8.ToArray()));
        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(5));
        using var server = await listener.AcceptTcpClientAsync(timeout.Token);
        await using var network = server.GetStream();
        await ReadUntilEndOfStreamFrameAsync(network);
        await network.WriteAsync(Encoding.ASCII.GetBytes(response), timeout.Token);
        Assert.Equal(FileMalwareScanStatus.Unavailable, await scan);
    }

    [Fact]
    public async Task Inspector_RejectsTruncatedUtf8AtEndOfFile()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        var content = Encoding.UTF8.GetBytes("valid")
            .Concat(new byte[] { 0xD8 })
            .ToArray();

        var exception = await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            inspector.InspectAsync(Upload("notes.txt", "text/plain", content)));

        Assert.Equal("FileContentSignatureMismatch", exception.Code);
    }

    [Fact]
    public async Task Inspector_RejectsTruncatedUtf8WhenFileEndsExactlyAtHeaderLimit()
    {
        var inspector = CreateInspector(scanningEnabled: false);
        var content = Enumerable.Repeat((byte)'a', 65_536).ToArray();
        content[^1] = 0xD8;

        var exception = await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            inspector.InspectAsync(Upload("notes.txt", "text/plain", content)));

        Assert.Equal("FileContentSignatureMismatch", exception.Code);
    }

    [Fact]
    public async Task ClamAvClient_PingAcceptsPong()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        var scanner = new ClamAvTcpClient(Options.Create(new FileSecurityOptions
        {
            MalwareScanningEnabled = true,
            ScannerHost = "127.0.0.1",
            ScannerPort = port
        }));

        var pingTask = scanner.PingAsync();
        using var server = await listener.AcceptTcpClientAsync();
        await using var network = server.GetStream();
        var request = new byte[6];
        await network.ReadExactlyAsync(request);
        Assert.Equal("zPING\0", Encoding.ASCII.GetString(request));
        await network.WriteAsync("PONG\0"u8.ToArray());
        await network.FlushAsync();

        Assert.True(await pingTask);
    }

    [Fact]
    public async Task ClamAvClient_PingRejectsWhitespacePong()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        var scanner = new ClamAvTcpClient(Options.Create(new FileSecurityOptions
        {
            MalwareScanningEnabled = true,
            ScannerHost = "127.0.0.1",
            ScannerPort = port
        }));

        var pingTask = scanner.PingAsync();
        using var server = await listener.AcceptTcpClientAsync();
        await using var network = server.GetStream();
        var request = new byte[6];
        await network.ReadExactlyAsync(request);
        await network.WriteAsync(" PONG\0"u8.ToArray());
        await network.FlushAsync();

        Assert.False(await pingTask);
    }

    [Fact]
    public async Task ClamAvClient_UnavailablePortFailsClosed()
    {
        using var listener = new TcpListener(IPAddress.Loopback, 0);
        listener.Start();
        var port = ((IPEndPoint)listener.LocalEndpoint).Port;
        listener.Stop();
        var scanner = new ClamAvTcpClient(Options.Create(new FileSecurityOptions
        {
            MalwareScanningEnabled = true,
            ScannerHost = "127.0.0.1",
            ScannerPort = port,
            ScannerTimeoutSeconds = 1
        }));

        Assert.Equal(
            FileMalwareScanStatus.Unavailable,
            await scanner.ScanAsync(Upload("notes.txt", "text/plain", Encoding.UTF8.GetBytes("hello"))));
    }

    [Theory]
    [InlineData(FileMalwareScanStatus.Clean, HealthStatus.Healthy)]
    [InlineData(FileMalwareScanStatus.Unavailable, HealthStatus.Unhealthy)]
    public async Task ClamAvReadiness_ReflectsScannerReachability(
        FileMalwareScanStatus scannerStatus,
        HealthStatus expected)
    {
        var healthCheck = new ClamAvHealthCheck(new FakeScanner(scannerStatus));

        var result = await healthCheck.CheckHealthAsync(new HealthCheckContext());

        Assert.Equal(expected, result.Status);
    }

    [Fact]
    public async Task FileOperations_PreInspectsEntireBulkBeforeWriting()
    {
        var events = new List<string>();
        var inspection = new RecordingInspection(events, rejectSecond: true);
        var binary = new RecordingBinaryStore(events);
        var metadata = new RecordingMetadataStore(events);
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddPlatformApplication();
        services.AddSingleton<IFileStoragePolicy>(new FileStoragePolicy());
        services.AddSingleton<IFileUploadInspectionService>(inspection);
        services.AddSingleton<IFileBinaryStore>(binary);
        services.AddSingleton<IFileMetadataStore>(metadata);
        services.AddSingleton<IFileChangePublisher, RecordingPublisher>();
        using var provider = services.BuildServiceProvider();

        await Assert.ThrowsAsync<FileUploadSecurityException>(() =>
            provider.GetRequiredService<ISender>().Send(new UploadManyFilesCommand(
            [
                Upload("one.pdf", "application/pdf", Encoding.ASCII.GetBytes("%PDF-1.7")),
                Upload("two.pdf", "application/pdf", Encoding.ASCII.GetBytes("%PDF-1.7"))
            ])));

        Assert.Equal(["inspect:one.pdf", "inspect:two.pdf"], events);
        Assert.Empty(binary.Writes);
        Assert.Empty(metadata.Added);
    }

    private static FileUploadInspectionService CreateInspector(
        bool scanningEnabled,
        IFileMalwareScanner? scanner = null) =>
        new(
            Options.Create(new FileSecurityOptions
            {
                MalwareScanningEnabled = scanningEnabled,
                ScannerHost = "127.0.0.1",
                ScannerPort = 3310
            }),
            scanner ?? new FakeScanner(FileMalwareScanStatus.Clean),
            NullLogger<FileUploadInspectionService>.Instance);

    private static PlatformFileUpload Upload(string fileName, string contentType, byte[] content) =>
        new(fileName, contentType, content.Length, () => new MemoryStream(content, writable: false));

    private sealed class ShortReadStream(byte[] bytes) : MemoryStream(bytes, writable: false)
    {
        public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default) =>
            base.ReadAsync(buffer[..Math.Min(buffer.Length, 7)], cancellationToken);
    }

    private static ClamAvTcpClient CreateScanner(TcpListener listener) =>
        new(Options.Create(new FileSecurityOptions
        {
            MalwareScanningEnabled = true,
            ScannerHost = "127.0.0.1",
            ScannerPort = ((IPEndPoint)listener.LocalEndpoint).Port,
            ScannerTimeoutSeconds = 2
        }));

    private static async Task ReadUntilEndOfStreamFrameAsync(NetworkStream network)
    {
        var command = new byte[10];
        await network.ReadExactlyAsync(command);
        Assert.Equal("zINSTREAM\0", Encoding.ASCII.GetString(command));

        var length = new byte[4];
        while (true)
        {
            await network.ReadExactlyAsync(length);
            var size = System.Buffers.Binary.BinaryPrimitives.ReadInt32BigEndian(length);
            if (size == 0)
                return;

            var payload = new byte[size];
            await network.ReadExactlyAsync(payload);
        }
    }

    private sealed class FakeScanner(FileMalwareScanStatus status) : IFileMalwareScanner
    {
        public Task<FileMalwareScanStatus> ScanAsync(
            PlatformFileUpload upload,
            CancellationToken cancellationToken = default) =>
            Task.FromResult(status);

        public Task<bool> PingAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult(status == FileMalwareScanStatus.Clean);
    }

    private sealed class RecordingInspection(List<string> events, bool rejectSecond) : IFileUploadInspectionService
    {
        private int _count;

        public Task InspectAsync(PlatformFileUpload upload, CancellationToken cancellationToken = default)
        {
            events.Add($"inspect:{upload.FileName}");
            if (rejectSecond && Interlocked.Increment(ref _count) == 2)
            {
                throw new FileUploadSecurityException(
                    FileUploadSecurityFailureKind.InvalidContent,
                    "FileContentInvalid");
            }

            return Task.CompletedTask;
        }
    }

    private sealed class RecordingBinaryStore(List<string> events) : IFileBinaryStore
    {
        public List<string> Writes { get; } = [];

        public Task WriteFileAsync(string storedFileName, PlatformFileUpload upload, CancellationToken cancellationToken = default)
        {
            Writes.Add(storedFileName);
            events.Add("write");
            return Task.CompletedTask;
        }

        public Task WriteImageAsync(string storedFileName, PlatformFileUpload upload, CancellationToken cancellationToken = default) =>
            WriteFileAsync(storedFileName, upload, cancellationToken);

        public Task<Stream?> OpenFileReadAsync(string storedFileName, CancellationToken cancellationToken = default) =>
            Task.FromResult<Stream?>(null);

        public Task DeleteFileAsync(string storedFileName, CancellationToken cancellationToken = default) =>
            Task.CompletedTask;
    }

    private sealed class RecordingMetadataStore(List<string> events) : IFileMetadataStore
    {
        public List<PlatformFileMetadataDraft> Added { get; } = [];

        public Task<IReadOnlyList<PlatformFileMetadata>> GetAllAsync(CancellationToken cancellationToken = default) =>
            Task.FromResult<IReadOnlyList<PlatformFileMetadata>>([]);

        public Task<PlatformFileMetadata?> FindByStoredFileNameAsync(string storedFileName, CancellationToken cancellationToken = default) =>
            Task.FromResult<PlatformFileMetadata?>(null);

        public Task<PlatformFileMetadata?> FindByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
            Task.FromResult<PlatformFileMetadata?>(null);

        public Task<PlatformFileMetadata> AddAsync(PlatformFileMetadataDraft draft, CancellationToken cancellationToken = default)
        {
            Added.Add(draft);
            events.Add("metadata");
            return Task.FromResult(Metadata(draft));
        }

        public Task<IReadOnlyList<PlatformFileMetadata>> AddRangeAsync(IReadOnlyCollection<PlatformFileMetadataDraft> drafts, CancellationToken cancellationToken = default)
        {
            Added.AddRange(drafts);
            events.Add("metadata");
            return Task.FromResult<IReadOnlyList<PlatformFileMetadata>>(drafts.Select(Metadata).ToArray());
        }

        public Task<PlatformFileMetadata?> RemoveByStoredFileNameAsync(string storedFileName, CancellationToken cancellationToken = default) =>
            Task.FromResult<PlatformFileMetadata?>(null);

        private static PlatformFileMetadata Metadata(PlatformFileMetadataDraft draft) => new(
            Guid.NewGuid(), draft.FileName, draft.StoredFileName, draft.ContentType, draft.FileExtension,
            DateTime.UtcNow, "pc", "user", false, "tenant", 1);
    }

    private sealed class RecordingPublisher : IFileChangePublisher
    {
        public void Publish(PlatformFileChange change)
        {
        }
    }
}

