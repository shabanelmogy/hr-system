using CrystalReportGeneratorApi.Runtime.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;

namespace CrystalReportGeneratorApi.Runtime.Inspection
{
    public enum CrystalReportTemplateValidationFailure
    {
        None = 0,
        SchemaMismatch = 1,
        ParameterMismatch = 2
    }

    public sealed class CrystalReportTemplateValidationResult
    {
        public CrystalReportTemplateValidationResult(
            CrystalReportTemplateValidationFailure failure,
            string reason)
        {
            Failure = failure;
            Reason = reason;
        }

        public CrystalReportTemplateValidationFailure Failure { get; private set; }
        public string Reason { get; private set; }
        public bool IsValid { get { return Failure == CrystalReportTemplateValidationFailure.None; } }
    }

    public sealed class CrystalReportTemplateMetadata
    {
        public CrystalReportTemplateMetadata(
            IReadOnlyList<CrystalReportTemplateTable> tables,
            IReadOnlyList<CrystalReportTemplateParameter> parameters)
        {
            Tables = tables ?? throw new ArgumentNullException(nameof(tables));
            Parameters = parameters ?? throw new ArgumentNullException(nameof(parameters));
        }

        public IReadOnlyList<CrystalReportTemplateTable> Tables { get; private set; }
        public IReadOnlyList<CrystalReportTemplateParameter> Parameters { get; private set; }
    }

    public sealed class CrystalReportTemplateTable
    {
        public CrystalReportTemplateTable(
            string name,
            IReadOnlyList<CrystalReportTemplateField> fields)
        {
            Name = name;
            Fields = fields;
        }

        public string Name { get; private set; }
        public IReadOnlyList<CrystalReportTemplateField> Fields { get; private set; }
    }

    public sealed class CrystalReportTemplateField
    {
        public CrystalReportTemplateField(string name, string type)
        {
            Name = name;
            Type = type;
        }

        public string Name { get; private set; }
        public string Type { get; private set; }
    }

    public sealed class CrystalReportTemplateParameter
    {
        public CrystalReportTemplateParameter(
            string name,
            string type,
            bool required,
            bool allowMultipleValues,
            bool discreteOnly,
            bool allowCustomValues,
            IReadOnlyList<string> allowedValues)
        {
            Name = name;
            Type = type;
            Required = required;
            AllowMultipleValues = allowMultipleValues;
            DiscreteOnly = discreteOnly;
            AllowCustomValues = allowCustomValues;
            AllowedValues = allowedValues;
        }

        public string Name { get; private set; }
        public string Type { get; private set; }
        public bool Required { get; private set; }
        public bool AllowMultipleValues { get; private set; }
        public bool DiscreteOnly { get; private set; }
        public bool AllowCustomValues { get; private set; }
        public IReadOnlyList<string> AllowedValues { get; private set; }
    }

    public static class CrystalReportTemplateContractValidator
    {
        public static CrystalReportTemplateValidationResult Validate(
            CrystalReportTemplateMetadata metadata,
            CrystalReportProfile profile)
        {
            if (metadata == null)
                throw new ArgumentNullException(nameof(metadata));
            if (profile == null)
                throw new ArgumentNullException(nameof(profile));

            if (metadata.Tables.Count != 1)
                return Schema("The Crystal report must contain exactly one managed data table.");

            var table = metadata.Tables[0];
            if (!string.Equals(table.Name, profile.TableName, StringComparison.Ordinal))
                return Schema("The Crystal report table name does not match the approved entity contract.");
            if (table.Fields.Count != profile.Columns.Count)
                return Schema("The Crystal report field count does not match the approved entity contract.");

            for (var index = 0; index < profile.Columns.Count; index++)
            {
                var expected = profile.Columns[index];
                var actual = table.Fields[index];
                if (!string.Equals(actual.Name, expected.Name, StringComparison.Ordinal) ||
                    !string.Equals(actual.Type, expected.Type, StringComparison.Ordinal))
                {
                    return Schema(
                        "The Crystal report field at position " + (index + 1) +
                        " does not match the approved entity contract.");
                }
            }

            if (metadata.Parameters.Count != profile.Parameters.Count)
                return Parameter("The Crystal report managed parameter set is not exact.");

            for (var index = 0; index < profile.Parameters.Count; index++)
            {
                var expected = profile.Parameters[index];
                var actual = metadata.Parameters[index];
                if (!string.Equals(actual.Name, expected.Name, StringComparison.Ordinal) ||
                    !string.Equals(actual.Type, expected.Type, StringComparison.Ordinal) ||
                    actual.Required != expected.Required ||
                    actual.AllowMultipleValues != expected.AllowMultipleValues ||
                    actual.DiscreteOnly != expected.DiscreteOnly ||
                    actual.AllowCustomValues ||
                    actual.AllowedValues.Count != expected.AllowedValues.Count ||
                    !new HashSet<string>(actual.AllowedValues, StringComparer.Ordinal)
                        .SetEquals(expected.AllowedValues))
                {
                    return Parameter(
                        "The Crystal report parameter '" + expected.Name +
                        "' does not match the approved managed parameter contract.");
                }
            }

            return new CrystalReportTemplateValidationResult(
                CrystalReportTemplateValidationFailure.None,
                null);
        }

        private static CrystalReportTemplateValidationResult Schema(string reason)
        {
            return new CrystalReportTemplateValidationResult(
                CrystalReportTemplateValidationFailure.SchemaMismatch,
                reason);
        }

        private static CrystalReportTemplateValidationResult Parameter(string reason)
        {
            return new CrystalReportTemplateValidationResult(
                CrystalReportTemplateValidationFailure.ParameterMismatch,
                reason);
        }
    }
}
