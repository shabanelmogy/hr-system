using CrystalDecisions.CrystalReports.Engine;
using CrystalDecisions.Shared;
using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.Linq;

namespace CrystalReportGeneratorApi.Runtime.Inspection
{
    public sealed class CrystalReportInspectionService
    {
        private readonly CrystalReportProfileRegistry _profiles;

        public CrystalReportInspectionService()
            : this(CrystalReportProfileRegistry.CreateDefault())
        {
        }

        public CrystalReportInspectionService(CrystalReportProfileRegistry profiles)
        {
            _profiles = profiles ?? throw new ArgumentNullException(nameof(profiles));
        }

        public CrystalReportInspectionResult Inspect(string reportFilePath, string entityKey)
        {
            if (string.IsNullOrWhiteSpace(reportFilePath))
                throw new ArgumentException("A report file path is required.", nameof(reportFilePath));

            var profile = _profiles.GetRequired(entityKey);
            using (var report = new ReportDocument())
            {
                try
                {
                    report.Load(reportFilePath, OpenReportMethod.OpenReportByTempCopy);

                    var rejectionReason = CrystalReportManagedSourcePolicy.GetRejectionReason(report);
                    if (rejectionReason != null)
                    {
                        throw new CrystalReportRejectedException(
                            InternalReportErrorCodes.SourceRejected,
                            rejectionReason);
                    }

                    ValidateTemplateContract(report, profile);
                    return new CrystalReportInspectionResult
                    {
                        IsValid = true,
                        Title = NormalizeSummary(report.SummaryInfo == null
                            ? null
                            : report.SummaryInfo.ReportTitle),
                        Subject = NormalizeSummary(report.SummaryInfo == null
                            ? null
                            : report.SummaryInfo.ReportSubject),
                        SubreportCount = 0,
                        ContractSchemaVersion = _profiles.SchemaVersion,
                        ContractFingerprint = _profiles.GetFingerprint(entityKey),
                        Failure = CrystalReportTemplateValidationFailure.None
                    };
                }
                finally
                {
                    report.Close();
                }
            }
        }

        /// <summary>
        /// Runs Crystal's Verify Database operation against the stored report and
        /// saves the adapted RPT to a caller-owned output path. The caller must
        /// inspect the output before it becomes a managed report version.
        /// </summary>
        public CrystalReportVerificationResult VerifyDatabase(
            string reportFilePath,
            string outputFilePath,
            string entityKey)
        {
            if (string.IsNullOrWhiteSpace(reportFilePath))
                throw new ArgumentException("A report file path is required.", nameof(reportFilePath));
            if (string.IsNullOrWhiteSpace(outputFilePath))
                throw new ArgumentException("An output file path is required.", nameof(outputFilePath));

            _profiles.GetRequired(entityKey);
            using (var report = new ReportDocument())
            {
                report.Load(reportFilePath, OpenReportMethod.OpenReportByTempCopy);
                var rejectionReason = CrystalReportManagedSourcePolicy.GetRejectionReason(report);
                if (rejectionReason != null)
                    throw new CrystalReportRejectedException(InternalReportErrorCodes.SourceRejected, rejectionReason);

                // Crystal owns the schema adaptation. It may add/remove database
                // fields in the saved report, but it never places new fields into
                // sections or invents layout/formatting.
                report.VerifyDatabase();
                report.SaveAs(outputFilePath);
            }

            var inspection = Inspect(outputFilePath, entityKey);
            return new CrystalReportVerificationResult
            {
                IsValid = inspection.IsValid,
                Title = inspection.Title,
                Subject = inspection.Subject,
                ContractSchemaVersion = inspection.ContractSchemaVersion,
                ContractFingerprint = inspection.ContractFingerprint,
                Failure = inspection.Failure
            };
        }

        internal static void ValidateTemplateContract(
            ReportDocument report,
            CrystalReportProfile profile)
        {
            var validation = CrystalReportTemplateContractValidator.Validate(
                ExtractMetadata(report),
                profile);
            if (validation.IsValid)
                return;

            var code = validation.Failure == CrystalReportTemplateValidationFailure.SchemaMismatch
                ? InternalReportErrorCodes.SchemaMismatch
                : InternalReportErrorCodes.ParameterMismatch;
            throw new CrystalReportRejectedException(code, validation.Reason);
        }

        private static CrystalReportTemplateMetadata ExtractMetadata(ReportDocument report)
        {
            var tables = report.Database.Tables.Cast<Table>()
                .Select(table => new CrystalReportTemplateTable(
                    table.Name,
                    table.Fields.Cast<DatabaseFieldDefinition>()
                        .Select(field => new CrystalReportTemplateField(
                            field.Name,
                            PortableFieldType(field.ValueType)))
                        .ToArray()))
                .ToArray();

            var parameters = report.DataDefinition.ParameterFields
                .Cast<ParameterFieldDefinition>()
                .Select(parameter => new CrystalReportTemplateParameter(
                    parameter.Name,
                    PortableParameterType(parameter.ParameterValueKind),
                    !parameter.IsOptionalPrompt && !parameter.EnableNullValue,
                    parameter.EnableAllowMultipleValue,
                    parameter.DiscreteOrRangeKind == DiscreteOrRangeKind.DiscreteValue,
                    parameter.EnableAllowEditingDefaultValue,
                    parameter.DefaultValues.Cast<ParameterValue>()
                        .OfType<ParameterDiscreteValue>()
                        .Select(value => Convert.ToString(value.Value))
                        .Where(value => value != null)
                        .ToArray()))
                .ToArray();

            return new CrystalReportTemplateMetadata(tables, parameters);
        }

        private static string PortableFieldType(FieldValueType valueType)
        {
            switch (valueType)
            {
                case FieldValueType.Int32sField:
                    return "int32";
                case FieldValueType.StringField:
                    return "string";
                case FieldValueType.DateTimeField:
                    return "datetime";
                default:
                    return "unsupported:" + valueType;
            }
        }

        private static string PortableParameterType(ParameterValueKind valueKind)
        {
            return valueKind == ParameterValueKind.StringParameter
                ? "string"
                : "unsupported:" + valueKind;
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
        public int SubreportCount { get; set; }
        public int ContractSchemaVersion { get; set; }
        public string ContractFingerprint { get; set; }
        public CrystalReportTemplateValidationFailure Failure { get; set; }
    }

    public sealed class CrystalReportVerificationResult
    {
        public bool IsValid { get; set; }
        public string Title { get; set; }
        public string Subject { get; set; }
        public int ContractSchemaVersion { get; set; }
        public string ContractFingerprint { get; set; }
        public CrystalReportTemplateValidationFailure Failure { get; set; }
    }

    public sealed class CrystalReportRejectedException : Exception
    {
        public CrystalReportRejectedException(string code, string message) : base(message)
        {
            Code = code;
        }

        public string Code { get; private set; }
    }
}
