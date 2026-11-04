using CrystalDecisions.CrystalReports.Engine;
using System;

namespace CrystalReportGeneratorApi.Runtime
{
    internal static class CrystalReportManagedSourcePolicy
    {
        public static string GetRejectionReason(ReportDocument report)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            try
            {
                var metadata = new CrystalReportSourceMetadata
                {
                    SubreportCount = report.Subreports.Count,
                    TableCount = report.Database == null ? 0 : report.Database.Tables.Count,
                    SqlExpressionCount = report.DataDefinition.SQLExpressionFields.Count
                };
                // Design connections and saved rows do not determine admission.
                // The renderer always binds the supplied data to the sole table.
                return CrystalReportPushedDataPolicy.GetRejectionReason(metadata);
            }
            catch
            {
                return "Crystal Report datasource metadata could not be verified safely.";
            }
        }
    }
}
