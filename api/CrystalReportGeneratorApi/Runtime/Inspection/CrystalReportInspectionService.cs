using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportGeneratorApi.Runtime;
using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CrystalReportGeneratorApi.Runtime.Inspection
{
    public sealed class CrystalReportInspectionService
    {
        public CrystalReportInspectionResult Inspect(string reportFilePath)
        {
            if (string.IsNullOrWhiteSpace(reportFilePath))
                throw new ArgumentException("A report file path is required.", nameof(reportFilePath));

            using (var report = new ReportDocument())
            {
                try
                {
                    report.Load(reportFilePath, OpenReportMethod.OpenReportByTempCopy);

                    var rejectionReason = CrystalReportManagedSourcePolicy.GetRejectionReason(report);
                    if (rejectionReason != null)
                        throw new CrystalReportRejectedException(rejectionReason);

                    rejectionReason = CrystalReportManagedParameters.GetRejectionReason(report);
                    if (rejectionReason != null)
                        throw new CrystalReportRejectedException(rejectionReason);

                    return new CrystalReportInspectionResult
                    {
                        IsValid = true,
                        Title = NormalizeSummary(report.SummaryInfo == null
                            ? null
                            : report.SummaryInfo.ReportTitle),
                        Subject = NormalizeSummary(report.SummaryInfo == null
                            ? null
                            : report.SummaryInfo.ReportSubject),
                        HasSavedData = false,
                        HasEmbeddedCredentials = false,
                        SubreportCount = 0
                    };
                }
                finally
                {
                    report.Close();
                }
            }
        }

        private static string NormalizeSummary(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            var normalized = new string(value.Where(character => !char.IsControl(character)).ToArray()).Trim();
            return normalized.Length <= 200 ? normalized : normalized.Substring(0, 200);
        }
    }

    public sealed class CrystalReportInspectionResult
    {
        public bool IsValid { get; set; }
        public string Title { get; set; }
        public string Subject { get; set; }
        public bool HasSavedData { get; set; }
        public bool HasEmbeddedCredentials { get; set; }
        public int SubreportCount { get; set; }
    }

    public sealed class CrystalReportRejectedException : Exception
    {
        public CrystalReportRejectedException(string message) : base(message)
        {
        }
    }
}
