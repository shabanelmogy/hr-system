using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Hosting;

namespace CrystalReportGeneratorApi.Runtime.Catalog
{
    public sealed class CrystalReportCatalogService
    {
        private static readonly byte[] OleSignature =
            { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };
        public IReadOnlyList<CrystalReportCatalogEntry> List(string entityKey)
        {
            var reportsRoot = ResolveReportsRoot();
            var requestedEntityKey = string.IsNullOrWhiteSpace(entityKey)
                ? null
                : NormalizeKey(entityKey);
            if (entityKey != null &&
                (string.IsNullOrWhiteSpace(requestedEntityKey) ||
                 !string.Equals(entityKey, requestedEntityKey, StringComparison.OrdinalIgnoreCase)))
                throw new CrystalReportCatalogValidationException("The entity key is invalid.");

            var entityFolders = GetApprovedEntityFolders(reportsRoot)
                .Where(folder => requestedEntityKey == null ||
                                 string.Equals(folder.Key, requestedEntityKey, StringComparison.Ordinal))
                .ToList();

            var duplicateEntityKey = entityFolders
                .GroupBy(folder => folder.Key, StringComparer.Ordinal)
                .FirstOrDefault(group => group.Count() > 1);
            if (duplicateEntityKey != null)
                throw new CrystalReportCatalogConflictException(
                    "The report catalog contains ambiguous entity keys.");

            if (requestedEntityKey != null && entityFolders.Count == 0)
                throw new CrystalReportCatalogNotFoundException();

            var entries = new List<CrystalReportCatalogEntry>();
            foreach (var folder in entityFolders)
            {
                foreach (var filePath in Directory.EnumerateFiles(
                             folder.FullPath,
                             "*.rpt",
                             SearchOption.TopDirectoryOnly)
                         .Where(path => IsApprovedReportFile(folder.FullPath, reportsRoot, path)))
                {
                    if (entries.Count >= CrystalReportRuntimeSettings.MaximumCatalogEntries)
                        throw new CrystalReportCatalogUnavailableException(
                            "The report catalog exceeds the configured entry limit.");
                    entries.Add(ReadCatalogFile(folder.Key, filePath));
                }
            }

            foreach (var duplicate in entries
                         .GroupBy(entry => entry.EntityKey + "\n" + entry.ReportKey, StringComparer.Ordinal)
                         .Where(group => group.Count() > 1))
            {
                foreach (var entry in duplicate)
                {
                    entry.IsImportable = false;
                    entry.ValidationReason = "Another report has the same normalized report key.";
                }
            }

            return entries
                .OrderBy(entry => entry.EntityKey, StringComparer.Ordinal)
                .ThenBy(entry => entry.Title, StringComparer.OrdinalIgnoreCase)
                .ThenBy(entry => entry.ReportKey, StringComparer.Ordinal)
                .ToList();
        }

        public CrystalReportCatalogSource OpenSource(string sourceId, string expectedSha256)
        {
            if (!IsLowerHexSha256(sourceId) || !IsLowerHexSha256(expectedSha256))
                throw new CrystalReportCatalogValidationException(
                    "A valid source id and expected SHA-256 are required.");

            var reportsRoot = ResolveReportsRoot();
            var matches = GetApprovedEntityFolders(reportsRoot)
                .SelectMany(folder => Directory.EnumerateFiles(
                        folder.FullPath,
                        "*.rpt",
                        SearchOption.TopDirectoryOnly)
                    .Where(path => IsApprovedReportFile(folder.FullPath, reportsRoot, path))
                    .Select(path => new SourceCandidate
                    {
                        EntityKey = folder.Key,
                        FilePath = path,
                        SourceId = CreateSourceId(
                            folder.Key,
                            NormalizeKey(Path.GetFileNameWithoutExtension(path)),
                            Path.GetFileName(path))
                    }))
                .Where(candidate => string.Equals(candidate.SourceId, sourceId, StringComparison.Ordinal))
                .ToList();

            if (matches.Count == 0)
                throw new CrystalReportCatalogNotFoundException();
            if (matches.Count > 1)
                throw new CrystalReportCatalogConflictException(
                    "The report source id is ambiguous.");

            var match = matches[0];
            var entry = ReadCatalogFile(match.EntityKey, match.FilePath);
            if (!entry.IsImportable)
                throw new CrystalReportCatalogConflictException(
                    entry.ValidationReason ?? "The report cannot be imported.");
            if (!string.Equals(entry.Sha256, expectedSha256, StringComparison.Ordinal))
                throw new CrystalReportCatalogConflictException(
                    "The report changed after catalog discovery. Refresh the catalog.");

            var stream = new FileStream(
                match.FilePath,
                FileMode.Open,
                FileAccess.Read,
                FileShare.Read,
                81920,
                FileOptions.SequentialScan);
            try
            {
                var streamedHash = ComputeSha256(stream);
                if (!string.Equals(streamedHash, expectedSha256, StringComparison.Ordinal))
                    throw new CrystalReportCatalogConflictException(
                        "The report changed before download. Refresh the catalog.");

                stream.Position = 0;
                return new CrystalReportCatalogSource(entry, stream);
            }
            catch
            {
                stream.Dispose();
                throw;
            }
        }

        private static CrystalReportCatalogEntry ReadCatalogFile(string entityKey, string filePath)
        {
            var file = new FileInfo(filePath);
            var entry = new CrystalReportCatalogEntry
            {
                EntityKey = entityKey,
                ReportKey = NormalizeKey(Path.GetFileNameWithoutExtension(file.Name)),
                FileName = file.Name,
                Title = NormalizeSummary(Path.GetFileNameWithoutExtension(file.Name)),
                Size = file.Exists ? file.Length : 0,
                LastModifiedUtc = file.Exists ? file.LastWriteTimeUtc : DateTime.MinValue,
                IsImportable = false
            };
            entry.SourceId = CreateSourceId(entry.EntityKey, entry.ReportKey, entry.FileName);

            if (string.IsNullOrWhiteSpace(entry.ReportKey) || string.IsNullOrWhiteSpace(entry.SourceId))
            {
                entry.ValidationReason = "The report filename cannot be normalized to a report key.";
                return entry;
            }
            if (!string.Equals(entry.ReportKey, entry.EntityKey, StringComparison.Ordinal) &&
                !entry.ReportKey.StartsWith(entry.EntityKey + "-", StringComparison.Ordinal))
            {
                entry.ValidationReason = "The report filename must begin with its entity key.";
                return entry;
            }
            if (!file.Exists || file.Length == 0)
            {
                entry.ValidationReason = "The report file is empty or unavailable.";
                return entry;
            }
            if (file.Length > CrystalReportRuntimeSettings.MaximumReportFileSizeBytes)
            {
                entry.ValidationReason = "The report exceeds the configured import limit.";
                return entry;
            }
            if (!HasOleSignature(file.FullName))
            {
                entry.ValidationReason = "The file does not have a supported Crystal Report signature.";
                return entry;
            }

            try
            {
                entry.Sha256 = ComputeSha256(file.FullName);
            }
            catch
            {
                entry.ValidationReason =
                    "The report file changed or became unavailable during inspection.";
                return entry;
            }

            entry.IsImportable = true;
            entry.ValidationReason = null;
            return entry;
        }

        private static IReadOnlyList<EntityFolder> GetApprovedEntityFolders(string reportsRoot)
        {
            return Directory.GetDirectories(reportsRoot, "*", SearchOption.TopDirectoryOnly)
                .Where(path => !IsReparsePoint(path))
                .Select(path => new EntityFolder
                {
                    Key = NormalizeKey(Path.GetFileName(path)),
                    FullPath = Path.GetFullPath(path)
                })
                .Where(folder => !string.IsNullOrWhiteSpace(folder.Key) &&
                                 IsContainedBy(reportsRoot, folder.FullPath))
                .ToList();
        }

        private static bool IsApprovedReportFile(
            string entityFolder,
            string reportsRoot,
            string filePath)
        {
            var fullPath = Path.GetFullPath(filePath);
            return string.Equals(Path.GetExtension(fullPath), ".rpt", StringComparison.OrdinalIgnoreCase) &&
                   string.Equals(Path.GetDirectoryName(fullPath), entityFolder, StringComparison.OrdinalIgnoreCase) &&
                   IsContainedBy(reportsRoot, fullPath) &&
                   !IsReparsePoint(fullPath);
        }

        private static string ResolveReportsRoot()
        {
            var mapped = HostingEnvironment.MapPath("~/Reports");
            if (string.IsNullOrWhiteSpace(mapped) ||
                !Directory.Exists(mapped) ||
                IsReparsePoint(mapped))
                throw new CrystalReportCatalogUnavailableException(
                    "The report catalog is unavailable.");

            return Path.GetFullPath(mapped)
                .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        }

        private static bool IsContainedBy(string root, string candidate)
        {
            var prefix = root.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                         + Path.DirectorySeparatorChar;
            return candidate.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsReparsePoint(string path)
        {
            try
            {
                return (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0;
            }
            catch
            {
                return true;
            }
        }

        private static bool HasOleSignature(string path)
        {
            try
            {
                using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
                {
                    var header = new byte[OleSignature.Length];
                    if (stream.Read(header, 0, header.Length) != header.Length)
                        return false;
                    return header.SequenceEqual(OleSignature);
                }
            }
            catch
            {
                return false;
            }
        }

        private static string ComputeSha256(string path)
        {
            using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read, FileShare.Read))
                return ComputeSha256(stream);
        }

        private static string ComputeSha256(Stream stream)
        {
            using (var sha256 = SHA256.Create())
                return ToLowerHex(sha256.ComputeHash(stream));
        }

        private static string CreateSourceId(string entityKey, string reportKey, string fileName)
        {
            if (string.IsNullOrWhiteSpace(entityKey) || string.IsNullOrWhiteSpace(reportKey))
                return null;

            using (var sha256 = SHA256.Create())
            {
                var identity = entityKey + "\n" + reportKey + "\n" + fileName;
                return ToLowerHex(sha256.ComputeHash(Encoding.UTF8.GetBytes(identity)));
            }
        }

        private static bool IsLowerHexSha256(string value) =>
            !string.IsNullOrWhiteSpace(value) &&
            Regex.IsMatch(value, "^[a-f0-9]{64}$", RegexOptions.CultureInvariant);

        private static string ToLowerHex(byte[] value) =>
            BitConverter.ToString(value).Replace("-", string.Empty).ToLowerInvariant();

        private static string NormalizeKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = Regex.Replace(
                    value.Trim().ToLowerInvariant(),
                    "[^a-z0-9]+",
                    "-")
                .Trim('-');
            return normalized.Length == 0 || normalized.Length > 128 ? null : normalized;
        }

        private static string NormalizeSummary(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = new string(value.Where(character => !char.IsControl(character)).ToArray()).Trim();
            return normalized.Length <= 200 ? normalized : normalized.Substring(0, 200);
        }

        private sealed class EntityFolder
        {
            public string Key { get; set; }
            public string FullPath { get; set; }
        }

        private sealed class SourceCandidate
        {
            public string EntityKey { get; set; }
            public string FilePath { get; set; }
            public string SourceId { get; set; }
        }
    }

    public sealed class CrystalReportCatalogEntry
    {
        public string SourceId { get; set; }
        public string EntityKey { get; set; }
        public string ReportKey { get; set; }
        public string FileName { get; set; }
        public string Title { get; set; }
        public string Subject { get; set; }
        public long Size { get; set; }
        public string Sha256 { get; set; }
        public DateTime LastModifiedUtc { get; set; }
        public bool IsImportable { get; set; }
        public string ValidationReason { get; set; }
    }

    public sealed class CrystalReportCatalogSource : IDisposable
    {
        public CrystalReportCatalogSource(CrystalReportCatalogEntry entry, Stream content)
        {
            Entry = entry;
            Content = content;
        }

        public CrystalReportCatalogEntry Entry { get; private set; }
        public Stream Content { get; private set; }

        public void Dispose()
        {
            Content.Dispose();
        }
    }

    public class CrystalReportCatalogException : Exception
    {
        public CrystalReportCatalogException(string message) : base(message)
        {
        }
    }

    public sealed class CrystalReportCatalogValidationException : CrystalReportCatalogException
    {
        public CrystalReportCatalogValidationException(string message) : base(message) { }
    }

    public sealed class CrystalReportCatalogConflictException : CrystalReportCatalogException
    {
        public CrystalReportCatalogConflictException(string message) : base(message) { }
    }

    public sealed class CrystalReportCatalogUnavailableException : CrystalReportCatalogException
    {
        public CrystalReportCatalogUnavailableException(string message) : base(message) { }
    }

    public sealed class CrystalReportCatalogNotFoundException : CrystalReportCatalogException
    {
        public CrystalReportCatalogNotFoundException() : base("The report source was not found.") { }
    }
}
