using System.Buffers.Binary;
using System.Net.Sockets;
using System.Text;
using Microsoft.Extensions.Options;

using ErpSystem.Modules.Platform.Contracts.Files;

namespace ErpSystem.Modules.Platform.Infrastructure.Files;

public enum FileMalwareScanStatus
{
    Clean = 1,
    MalwareDetected = 2,
    Unavailable = 3
}

public interface IFileMalwareScanner
{
    Task<FileMalwareScanStatus> ScanAsync(
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default);

    Task<bool> PingAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Minimal bounded ClamAV TCP client. The client only sends bytes from the
/// upload stream and never logs file names, content, or scanner responses.
/// </summary>
public sealed class ClamAvTcpClient(IOptions<FileSecurityOptions> options) : IFileMalwareScanner
{
    private readonly FileSecurityOptions _options = options.Value;

    public async Task<FileMalwareScanStatus> ScanAsync(
        PlatformFileUpload upload,
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var timeout = CreateTimeoutToken(cancellationToken);
            using var client = new TcpClient { NoDelay = true };
            await client.ConnectAsync(_options.ScannerHost, _options.ScannerPort, timeout.Token)
                .ConfigureAwait(false);
            await using var network = client.GetStream();

            await network.WriteAsync("zINSTREAM\0"u8.ToArray(), timeout.Token).ConfigureAwait(false);

            await using var input = upload.OpenReadStream();
            var buffer = new byte[_options.ScannerChunkSizeBytes];
            var length = new byte[sizeof(int)];
            long total = 0;

            while (true)
            {
                var read = await input.ReadAsync(buffer.AsMemory(), timeout.Token).ConfigureAwait(false);
                if (read == 0)
                    break;

                total += read;
                if (total > _options.MaxScanBytes)
                    return FileMalwareScanStatus.Unavailable;

                BinaryPrimitives.WriteInt32BigEndian(length, read);
                await network.WriteAsync(length.AsMemory(), timeout.Token).ConfigureAwait(false);
                await network.WriteAsync(buffer.AsMemory(0, read), timeout.Token).ConfigureAwait(false);
            }

            if (total != upload.Length)
                return FileMalwareScanStatus.Unavailable;

            BinaryPrimitives.WriteInt32BigEndian(length, 0);
            await network.WriteAsync(length.AsMemory(), timeout.Token).ConfigureAwait(false);
            await network.FlushAsync(timeout.Token).ConfigureAwait(false);

            var response = await ReadLineAsync(network, _options.ScannerMaxResponseBytes, timeout.Token)
                .ConfigureAwait(false);
            return ParseScanResponse(response);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return FileMalwareScanStatus.Unavailable;
        }
        catch (SocketException)
        {
            return FileMalwareScanStatus.Unavailable;
        }
        catch (IOException)
        {
            return FileMalwareScanStatus.Unavailable;
        }
        catch (ObjectDisposedException)
        {
            return FileMalwareScanStatus.Unavailable;
        }
    }

    public async Task<bool> PingAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            using var timeout = CreateTimeoutToken(cancellationToken);
            using var client = new TcpClient { NoDelay = true };
            await client.ConnectAsync(_options.ScannerHost, _options.ScannerPort, timeout.Token)
                .ConfigureAwait(false);
            await using var network = client.GetStream();
            await network.WriteAsync("zPING\0"u8.ToArray(), timeout.Token).ConfigureAwait(false);
            await network.FlushAsync(timeout.Token).ConfigureAwait(false);

            var response = await ReadLineAsync(network, _options.ScannerMaxResponseBytes, timeout.Token)
                .ConfigureAwait(false);
            return string.Equals(response, "PONG", StringComparison.OrdinalIgnoreCase);
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return false;
        }
        catch (SocketException)
        {
            return false;
        }
        catch (IOException)
        {
            return false;
        }
        catch (ObjectDisposedException)
        {
            return false;
        }
    }

    private CancellationTokenSource CreateTimeoutToken(CancellationToken cancellationToken)
    {
        var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        timeout.CancelAfter(TimeSpan.FromSeconds(_options.ScannerTimeoutSeconds));
        return timeout;
    }

    private static FileMalwareScanStatus ParseScanResponse(string? response)
    {
        if (string.IsNullOrWhiteSpace(response))
            return FileMalwareScanStatus.Unavailable;

        var value = response;
        if (string.Equals(value, "stream: OK", StringComparison.OrdinalIgnoreCase))
        {
            return FileMalwareScanStatus.Clean;
        }

        if (value.StartsWith("stream: ", StringComparison.OrdinalIgnoreCase) &&
            value.EndsWith(" FOUND", StringComparison.OrdinalIgnoreCase) &&
            value.Length > "stream:  FOUND".Length)
        {
            return FileMalwareScanStatus.MalwareDetected;
        }

        return FileMalwareScanStatus.Unavailable;
    }

    private static async Task<string?> ReadLineAsync(
        NetworkStream network,
        int maximumBytes,
        CancellationToken cancellationToken)
    {
        var response = new StringBuilder(Math.Min(maximumBytes, 256));
        var oneByte = new byte[1];
        while (response.Length < maximumBytes)
        {
            var read = await network.ReadAsync(oneByte.AsMemory(), cancellationToken).ConfigureAwait(false);
            if (read == 0)
                return null;

            if (oneByte[0] == 0)
                return response.ToString();

            if (oneByte[0] == (byte)'\n')
                return null;

            response.Append((char)oneByte[0]);
        }

        return null;
    }
}
