using CrystalDecisions.CrystalReports.Engine;
using System;

namespace CrystalReportGeneratorApi.Helpers.CrystalReport
{
    public static class CrystalReportInfo
    {
        public static string GetLocalizedPattern(string key, string lang)
        {
            var localizationService = new LocalizationService(lang);
            return $"'{localizationService.GetLocalizedString(key)}'";
        }

        public static string GetReportTitle(ReportDocument reportDocument)
        {
            if (reportDocument == null)
                throw new ArgumentNullException(nameof(reportDocument));

            try
            {
                var summaryInfo = reportDocument.SummaryInfo;
                if (summaryInfo == null)
                    throw new InvalidOperationException("SummaryInfo is missing.");

                return summaryInfo.ReportTitle;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error retrieving report title.", ex);
            }
        }

        public static string GetReportSubject(ReportDocument reportDocument)
        {
            if (reportDocument == null)
                throw new ArgumentNullException(nameof(reportDocument));

            try
            {
                var summaryInfo = reportDocument.SummaryInfo;
                if (summaryInfo == null)
                    throw new InvalidOperationException("SummaryInfo is missing.");

                return summaryInfo.ReportSubject;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error retrieving report title.", ex);
            }
        }
    }
}