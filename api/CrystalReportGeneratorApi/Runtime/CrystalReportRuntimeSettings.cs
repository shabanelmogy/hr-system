using System;
using System.Configuration;

namespace CrystalReportGeneratorApi.Runtime
{
    internal static class CrystalReportRuntimeSettings
    {
        private const long Mebibyte = 1024L * 1024L;

        public static readonly long MaximumReportFileSizeBytes = ReadLong(
            "CRYSTAL_REPORT_MAX_FILE_SIZE_BYTES",
            "MaxFileSizeBytes",
            10L * Mebibyte,
            1,
            10L * Mebibyte);

        public static readonly long MaximumRuntimeDataSizeBytes = ReadLong(
            "CRYSTAL_REPORT_MAX_RUNTIME_DATA_SIZE_BYTES",
            "MaxRuntimeDataSizeBytes",
            10L * Mebibyte,
            1,
            10L * Mebibyte);

        public static readonly long MaximumRenderedFileSizeBytes = ReadLong(
            "CRYSTAL_REPORT_MAX_RENDERED_FILE_SIZE_BYTES",
            "MaxRenderedFileSizeBytes",
            50L * Mebibyte,
            1,
            100L * Mebibyte);

        public static readonly int MaximumCatalogEntries = checked((int)ReadLong(
            "CRYSTAL_REPORT_MAX_CATALOG_ENTRIES",
            "MaxCatalogEntries",
            1000,
            1,
            10000));

        public static void Validate()
        {
            // Accessing the static fields above validates all configured values.
        }

        private static long ReadLong(
            string environmentName,
            string appSettingName,
            long fallback,
            long minimum,
            long maximum)
        {
            var raw = Environment.GetEnvironmentVariable(environmentName);
            if (string.IsNullOrWhiteSpace(raw))
                raw = ConfigurationManager.AppSettings[appSettingName];
            if (string.IsNullOrWhiteSpace(raw))
                return fallback;

            long parsed;
            if (!long.TryParse(raw, out parsed) || parsed < minimum || parsed > maximum)
                throw new ConfigurationErrorsException(
                    appSettingName + " must be between " + minimum + " and " + maximum + ".");

            return parsed;
        }
    }
}
