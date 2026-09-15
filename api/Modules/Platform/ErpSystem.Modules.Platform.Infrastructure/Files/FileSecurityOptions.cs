using System.Net;

namespace ErpSystem.Modules.Platform.Infrastructure.Files;

public sealed class FileSecurityOptions
{
    public const string SectionName = "FileSecurity";

    public bool MalwareScanningEnabled { get; set; }

    public string ScannerHost { get; set; } = "127.0.0.1";

    public int ScannerPort { get; set; } = 3310;

    public int HeaderReadLimitBytes { get; set; } = 64 * 1024;

    public int ScannerChunkSizeBytes { get; set; } = 32 * 1024;

    public int ScannerMaxResponseBytes { get; set; } = 4 * 1024;

    public int ScannerTimeoutSeconds { get; set; } = 10;

    public long MaxScanBytes { get; set; } = 50L * 1024 * 1024;

    public bool IsValid(out string error)
    {
        if (ScannerPort is < 1 or > 65535)
        {
            error = "FileSecurity:ScannerPort must be between 1 and 65535.";
            return false;
        }

        if (HeaderReadLimitBytes is < 512 or > 1024 * 1024)
        {
            error = "FileSecurity:HeaderReadLimitBytes must be between 512 and 1048576.";
            return false;
        }

        if (ScannerChunkSizeBytes is < 512 or > 1024 * 1024)
        {
            error = "FileSecurity:ScannerChunkSizeBytes must be between 512 and 1048576.";
            return false;
        }

        if (ScannerMaxResponseBytes is < 64 or > 64 * 1024)
        {
            error = "FileSecurity:ScannerMaxResponseBytes must be between 64 and 65536.";
            return false;
        }

        if (ScannerTimeoutSeconds is < 1 or > 120)
        {
            error = "FileSecurity:ScannerTimeoutSeconds must be between 1 and 120.";
            return false;
        }

        if (MaxScanBytes is < 1 or > 512L * 1024 * 1024)
        {
            error = "FileSecurity:MaxScanBytes must be between 1 and 536870912.";
            return false;
        }

        if (MalwareScanningEnabled && !IsValidHost(ScannerHost))
        {
            error = "FileSecurity:ScannerHost must be a valid DNS name or IP address when malware scanning is enabled.";
            return false;
        }

        error = string.Empty;
        return true;
    }

    private static bool IsValidHost(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return false;

        var host = value.Trim();
        if (IPAddress.TryParse(host, out _))
            return true;

        if (host.Contains('/') || host.Contains(':'))
            return false;

        return Uri.CheckHostName(host) is UriHostNameType.Dns or UriHostNameType.Basic;
    }
}
