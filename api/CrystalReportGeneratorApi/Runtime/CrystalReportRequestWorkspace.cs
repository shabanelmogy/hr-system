using System;
using System.IO;

namespace CrystalReportGeneratorApi.Runtime
{
    internal sealed class CrystalReportRequestWorkspace : IDisposable
    {
        private const string RuntimeTempDirectoryName = "erpsystem-crystal-runtime";
        private readonly string _requestDirectory;
        private bool _disposed;

        private CrystalReportRequestWorkspace(string requestDirectory)
        {
            _requestDirectory = requestDirectory;
        }

        public string DirectoryPath => _requestDirectory;

        public static CrystalReportRequestWorkspace Create(string operationName)
        {
            if (string.IsNullOrWhiteSpace(operationName))
                throw new ArgumentException("A workspace operation name is required.", nameof(operationName));

            var root = Path.GetFullPath(Path.Combine(
                Path.GetTempPath(),
                RuntimeTempDirectoryName,
                operationName));
            Directory.CreateDirectory(root);

            var requestDirectory = Path.Combine(root, Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(requestDirectory);
            return new CrystalReportRequestWorkspace(requestDirectory);
        }

        public static void ScavengeStaleDirectories(TimeSpan minimumAge)
        {
            if (minimumAge <= TimeSpan.Zero)
                throw new ArgumentOutOfRangeException(nameof(minimumAge));

            var root = Path.GetFullPath(Path.Combine(Path.GetTempPath(), RuntimeTempDirectoryName));
            if (!Directory.Exists(root))
                return;

            var cutoffUtc = DateTime.UtcNow.Subtract(minimumAge);
            try
            {
                foreach (var operationDirectory in Directory.EnumerateDirectories(root))
                {
                    if (!IsContainedBy(root, operationDirectory))
                        continue;

                    foreach (var requestDirectory in Directory.EnumerateDirectories(operationDirectory))
                    {
                        Guid requestId;
                        if (!Guid.TryParseExact(Path.GetFileName(requestDirectory), "N", out requestId) ||
                            !IsContainedBy(root, requestDirectory))
                            continue;

                        try
                        {
                            var lastWriteUtc = Directory.GetLastWriteTimeUtc(requestDirectory);
                            if (lastWriteUtc < cutoffUtc)
                                Directory.Delete(requestDirectory, recursive: true);
                        }
                        catch
                        {
                            // Another worker may still own the directory; leave it for a later startup.
                        }
                    }
                }
            }
            catch
            {
                // Scavenging must never prevent the runtime from starting.
            }
        }

        private static bool IsContainedBy(string root, string candidate)
        {
            var rootPrefix = root.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                             + Path.DirectorySeparatorChar;
            var fullCandidate = Path.GetFullPath(candidate);
            return fullCandidate.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase);
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;
            try
            {
                if (Directory.Exists(_requestDirectory))
                    Directory.Delete(_requestDirectory, recursive: true);
            }
            catch
            {
                // Never mask the request result because the OS still owns final temp cleanup.
                // Stale request directories can be scavenged independently by operations tooling.
            }
        }
    }
}
