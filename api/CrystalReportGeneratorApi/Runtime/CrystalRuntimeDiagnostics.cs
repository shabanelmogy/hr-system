using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web.Hosting;

namespace CrystalReportGeneratorApi.Runtime
{
    internal static class CrystalRuntimeDiagnostics
    {
        private const string CorrelationHeaderName = "X-Correlation-ID";
        private const long MaximumLogFileBytes = 5L * 1024L * 1024L;
        private const int MaximumBackupFiles = 5;
        private static readonly object Sync = new object();
        private static bool _initialized;
        private static string _logFilePath;

        public static void Initialize()
        {
            lock (Sync)
            {
                if (_initialized)
                    return;

                try
                {
                    _logFilePath = Path.Combine(ResolveWritableLogDirectory(), "crystal-runtime.log");
                }
                catch
                {
                    _logFilePath = null;
                }

                _initialized = true;
            }
        }

        private static string ResolveWritableLogDirectory()
        {
            var preferred = HostingEnvironment.MapPath("~/App_Data/Logs");
            if (!string.IsNullOrWhiteSpace(preferred))
            {
                try
                {
                    Directory.CreateDirectory(preferred);
                    return preferred;
                }
                catch
                {
                    // Fall back to the worker temp directory below.
                }
            }

            var fallback = Path.Combine(Path.GetTempPath(), "erpsystem-crystal-runtime-logs");
            Directory.CreateDirectory(fallback);
            return fallback;
        }

        public static void Information(HttpRequestMessage request, string operation, string code) =>
            Write(LogLevel.Info, request, operation, code, null);

        public static void Warning(
            HttpRequestMessage request,
            string operation,
            string code,
            Exception exception = null) =>
            Write(LogLevel.Warning, request, operation, code, exception);

        public static void Error(
            HttpRequestMessage request,
            string operation,
            string code,
            Exception exception = null) =>
            Write(LogLevel.Error, request, operation, code, exception);

        private static void Write(
            LogLevel level,
            HttpRequestMessage request,
            string operation,
            string code,
            Exception exception)
        {
            try
            {
                Initialize();
                var correlationId = GetCorrelationId(request);
                var exceptionType = exception == null ? "none" : exception.GetType().FullName;
                var message = "operation=" + SafeToken(operation, 64) +
                              " code=" + SafeToken(code, 64) +
                              " correlationId=" + SafeToken(correlationId, 128) +
                              " exceptionType=" + SafeToken(exceptionType, 160);
                var line = DateTime.UtcNow.ToString(
                               "yyyy-MM-dd'T'HH:mm:ss.fff'Z'",
                               CultureInfo.InvariantCulture) +
                           "|" + level.ToString().ToUpperInvariant() + "|" + message;

                lock (Sync)
                {
                    if (string.IsNullOrWhiteSpace(_logFilePath))
                        return;

                    RotateIfRequired(_logFilePath, Encoding.UTF8.GetByteCount(line) + Environment.NewLine.Length);
                    using (var stream = new FileStream(
                               _logFilePath,
                               FileMode.Append,
                               FileAccess.Write,
                               FileShare.Read))
                    using (var writer = new StreamWriter(stream, new UTF8Encoding(false)))
                        writer.WriteLine(line);
                }
            }
            catch
            {
                // Diagnostics are best effort and must not alter request semantics.
            }
        }

        private static void RotateIfRequired(string path, int incomingBytes)
        {
            if (!File.Exists(path) || new FileInfo(path).Length + incomingBytes <= MaximumLogFileBytes)
                return;

            for (var index = MaximumBackupFiles; index >= 2; index--)
            {
                var source = path + "." + (index - 1).ToString(CultureInfo.InvariantCulture);
                var destination = path + "." + index.ToString(CultureInfo.InvariantCulture);
                if (!File.Exists(source))
                    continue;
                if (File.Exists(destination))
                    File.Delete(destination);
                File.Move(source, destination);
            }

            var firstBackup = path + ".1";
            if (File.Exists(firstBackup))
                File.Delete(firstBackup);
            File.Move(path, firstBackup);
        }

        private static string GetCorrelationId(HttpRequestMessage request)
        {
            if (request == null || !request.Headers.TryGetValues(CorrelationHeaderName, out var values))
                return "none";

            return values.FirstOrDefault() ?? "none";
        }

        private static string SafeToken(string value, int maximumLength)
        {
            if (string.IsNullOrWhiteSpace(value))
                return "none";

            var safe = new string(value.Where(character =>
                (character >= 'a' && character <= 'z') ||
                (character >= 'A' && character <= 'Z') ||
                (character >= '0' && character <= '9') ||
                character == '-' || character == '_' || character == '.' || character == ':').ToArray());
            if (safe.Length == 0)
                return "none";
            return safe.Length <= maximumLength ? safe : safe.Substring(0, maximumLength);
        }

        private enum LogLevel
        {
            Info,
            Warning,
            Error
        }
    }
}
