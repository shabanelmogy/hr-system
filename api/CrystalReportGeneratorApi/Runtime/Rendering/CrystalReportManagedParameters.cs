using CrystalDecisions.CrystalReports.Engine;
using System;
using System.Linq;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    internal static class CrystalReportManagedParameters
    {
        private const string LanguageParameterName = "Language";

        public static void Apply(ReportDocument report, string language)
        {
            if (report == null)
                throw new ArgumentNullException(nameof(report));

            var languageParameter = report.DataDefinition.ParameterFields
                .Cast<ParameterFieldDefinition>()
                .FirstOrDefault(parameter => string.Equals(
                    parameter.Name,
                    LanguageParameterName,
                    StringComparison.OrdinalIgnoreCase));
            // Render requests still select ar/en. A report only needs this field
            // when its own formulas or layout use that language value.
            if (languageParameter != null)
                report.SetParameterValue(languageParameter.Name, language);
        }
    }
}
