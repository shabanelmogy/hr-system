using CrystalDecisions.CrystalReports.Engine;
using System;
using System.Linq;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    internal static class CrystalReportManagedParameters
    {
        private const string LanguageParameterName = "Language";

        public static string GetRejectionReason(ReportDocument report)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            var language = report.DataDefinition.ParameterFields
                .Cast<ParameterFieldDefinition>()
                .FirstOrDefault(parameter => string.Equals(
                    parameter.Name,
                    LanguageParameterName,
                    StringComparison.OrdinalIgnoreCase));
            return language == null
                ? "Managed Crystal Report files must declare the Language parameter."
                : null;
        }

        public static void Apply(ReportDocument report, string language)
        {
            var rejectionReason = GetRejectionReason(report);
            if (rejectionReason != null)
                throw new UnsupportedCrystalReportProfileException(rejectionReason);

            var parameterName = report.DataDefinition.ParameterFields
                .Cast<ParameterFieldDefinition>()
                .First(parameter => string.Equals(
                    parameter.Name,
                    LanguageParameterName,
                    StringComparison.OrdinalIgnoreCase))
                .Name;
            report.SetParameterValue(parameterName, language);
        }
    }
}
