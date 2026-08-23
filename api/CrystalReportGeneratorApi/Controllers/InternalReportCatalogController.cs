using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportGeneratorApi.Filters;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Web.Hosting;
using System.Web.Http;

namespace CrystalReportGeneratorApi.Controllers
{
    /// <summary>
    /// Service-to-service discovery and source download for deployment-owned reports.
    /// Client-provided paths are deliberately unsupported; resources are selected only
    /// through normalized keys resolved against direct children of ~/Reports.
    /// </summary>
    [InternalApiKey]
    public sealed class InternalReportCatalogController : ApiController
    {
        private const long MaximumReportSizeBytes = 10L * 1024L * 1024L;
        private static readonly byte[] OleSignature =
            { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };

        /// <summary>
        /// Lists direct .rpt files from direct entity folders under ~/Reports.
        /// Invalid reports remain visible with IsImportable=false and a safe reason.
        /// </summary>
        [HttpGet]
        [Route("internal/reports/catalog")]
        public IHttpActionResult List([FromUri] string entityKey = null)
        {
            try
            {
            var reportsRoot = ResolveReportsRoot();
            if (reportsRoot == null)
                return Content(HttpStatusCode.ServiceUnavailable, "The report catalog is unavailable.");

            var requestedEntityKey = string.IsNullOrWhiteSpace(entityKey)
                ? null
                : NormalizeKey(entityKey);
            if (entityKey != null &&
                (string.IsNullOrWhiteSpace(requestedEntityKey) ||
                 !string.Equals(entityKey, requestedEntityKey, StringComparison.OrdinalIgnoreCase)))
                return BadRequest("The entity key is invalid.");

            var entityFolders = GetApprovedEntityFolders(reportsRoot)
                .Where(folder => requestedEntityKey == null ||
                                 string.Equals(folder.Key, requestedEntityKey, StringComparison.Ordinal))
                .ToList();

            var duplicateEntityKey = entityFolders
                .GroupBy(folder => folder.Key, StringComparer.Ordinal)
                .FirstOrDefault(group => group.Count() > 1);
            if (duplicateEntityKey != null)
                return Content(HttpStatusCode.Conflict, "The report catalog contains ambiguous entity keys.");

            if (requestedEntityKey != null && entityFolders.Count == 0)
                return NotFound();

            var entries = new List<CatalogEntry>();
            foreach (var folder in entityFolders)
            {
                foreach (var filePath in Directory.GetFiles(folder.FullPath, "*.rpt", SearchOption.TopDirectoryOnly)
                             .Where(path => IsApprovedReportFile(folder.FullPath, reportsRoot, path)))
                {
                    entries.Add(InspectCatalogFile(folder.Key, filePath));
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

            return Ok(entries
                .OrderBy(entry => entry.EntityKey, StringComparer.Ordinal)
                .ThenBy(entry => entry.Title, StringComparer.OrdinalIgnoreCase)
                .ThenBy(entry => entry.ReportKey, StringComparer.Ordinal)
                .ToList());
            }
            catch
            {
                return Content(HttpStatusCode.ServiceUnavailable, "The report catalog could not be read.");
            }
        }

        /// <summary>
        /// Downloads one importable deployment-owned report selected by its opaque catalog id.
        /// The expected hash prevents importing a source that changed after catalog discovery.
        /// </summary>
        [HttpGet]
        [Route("internal/reports/catalog/{sourceId}/source")]
        public IHttpActionResult DownloadSource(string sourceId, [FromUri] string expectedSha256)
        {
            try
            {
            if (!IsLowerHexSha256(sourceId) || !IsLowerHexSha256(expectedSha256))
                return BadRequest("A valid source id and expected SHA-256 are required.");

            var reportsRoot = ResolveReportsRoot();
            if (reportsRoot == null)
                return Content(HttpStatusCode.ServiceUnavailable, "The report catalog is unavailable.");

            var matches = GetApprovedEntityFolders(reportsRoot)
                .SelectMany(folder => Directory.GetFiles(
                        folder.FullPath, "*.rpt", SearchOption.TopDirectoryOnly)
                    .Where(path => IsApprovedReportFile(folder.FullPath, reportsRoot, path))
                    .Select(path => new
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
                return NotFound();
            if (matches.Count > 1)
                return Content(HttpStatusCode.Conflict, "The report source id is ambiguous.");

            var entry = InspectCatalogFile(matches[0].EntityKey, matches[0].FilePath);
            if (!entry.IsImportable)
                return Content(HttpStatusCode.Conflict, entry.ValidationReason ?? "The report cannot be imported.");
            if (!string.Equals(entry.Sha256, expectedSha256, StringComparison.Ordinal))
                return Content(HttpStatusCode.Conflict, "The report changed after catalog discovery. Refresh the catalog.");

            var stream = new FileStream(
                matches[0].FilePath, FileMode.Open, FileAccess.Read, FileShare.Read,
                81920, FileOptions.SequentialScan);
            var streamedHash = ComputeSha256(stream);
            if (!string.Equals(streamedHash, expectedSha256, StringComparison.Ordinal))
            {
                stream.Dispose();
                return Content(HttpStatusCode.Conflict, "The report changed before download. Refresh the catalog.");
            }
            stream.Position = 0;
            var response = Request.CreateResponse(HttpStatusCode.OK);
            response.Content = new StreamContent(stream);
            response.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            response.Content.Headers.ContentLength = stream.Length;
            response.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = "\"" + entry.FileName.Replace("\"", string.Empty) + "\""
            };
            response.Headers.CacheControl = new CacheControlHeaderValue
            {
                NoCache = true,
                NoStore = true,
                MustRevalidate = true
            };
            return ResponseMessage(response);
            }
            catch
            {
                return Content(HttpStatusCode.ServiceUnavailable, "The report source could not be read.");
            }
        }

        private static CatalogEntry InspectCatalogFile(string entityKey, string filePath)
        {
            var file = new FileInfo(filePath);
            var entry = new CatalogEntry
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
            if (file.Length > MaximumReportSizeBytes)
            {
                entry.ValidationReason = "The report exceeds the 10 MiB import limit.";
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
                entry.ValidationReason = "The report file changed or became unavailable during inspection.";
                return entry;
            }

            try
            {
                using (var report = new ReportDocument())
                {
                    report.Load(file.FullName, OpenReportMethod.OpenReportByTempCopy);
                    var documents = new List<ReportDocument> { report };
                    documents.AddRange(report.Subreports.Cast<ReportDocument>());

                    if (documents.Any(document => document.HasSavedData))
                    {
                        entry.ValidationReason = "Reports containing saved data cannot be imported.";
                        return entry;
                    }
                    if (documents.Any(HasEmbeddedPassword))
                    {
                        entry.ValidationReason = "Reports containing embedded database credentials cannot be imported.";
                        return entry;
                    }

                    var title = NormalizeSummary(report.SummaryInfo == null
                        ? null
                        : report.SummaryInfo.ReportTitle);
                    entry.Title = string.IsNullOrWhiteSpace(title)
                        ? NormalizeSummary(Path.GetFileNameWithoutExtension(file.Name))
                        : title;
                    entry.Subject = NormalizeSummary(report.SummaryInfo == null
                        ? null
                        : report.SummaryInfo.ReportSubject);
                    entry.IsImportable = true;
                    entry.ValidationReason = null;
                    return entry;
                }
            }
            catch
            {
                entry.ValidationReason = "The file could not be opened as a supported Crystal Report.";
                return entry;
            }
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

        private static bool IsApprovedReportFile(string entityFolder, string reportsRoot, string filePath)
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
            if (string.IsNullOrWhiteSpace(mapped) || !Directory.Exists(mapped) || IsReparsePoint(mapped))
                return null;
            return Path.GetFullPath(mapped).TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        }

        private static bool IsContainedBy(string root, string candidate)
        {
            var prefix = root.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
                         + Path.DirectorySeparatorChar;
            return candidate.StartsWith(prefix, StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsReparsePoint(string path)
        {
            try { return (File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0; }
            catch { return true; }
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
            catch { return false; }
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

        private static bool HasEmbeddedPassword(ReportDocument report)
        {
            foreach (Table table in report.Database.Tables)
            {
                var connection = table.LogOnInfo == null ? null : table.LogOnInfo.ConnectionInfo;
                if (connection != null && !string.IsNullOrWhiteSpace(connection.Password))
                    return true;
            }
            return false;
        }

        private static string NormalizeKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;
            var normalized = Regex.Replace(value.Trim().ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');
            return normalized.Length == 0 || normalized.Length > 128 ? null : normalized;
        }

        private static string NormalizeSummary(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;
            var normalized = new string(value.Where(character => !char.IsControl(character)).ToArray()).Trim();
            return normalized.Length <= 200 ? normalized : normalized.Substring(0, 200);
        }

        public sealed class CatalogEntry
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

        private sealed class EntityFolder
        {
            public string Key { get; set; }
            public string FullPath { get; set; }
        }
    }
}
