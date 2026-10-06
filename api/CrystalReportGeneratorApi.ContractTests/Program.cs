using CrystalReportGeneratorApi.Runtime.Rendering;
using CrystalReportGeneratorApi.Runtime.Inspection;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;

namespace CrystalReportGeneratorApi.ContractTests
{
    internal static class Program
    {
        private static int Main(string[] args)
        {
            try
            {
                if (args.Length != 2)
                {
                    throw new InvalidOperationException(
                        "Expected the canonical JSON path and built runtime assembly path.");
                }

                var sourceBytes = File.ReadAllBytes(args[0]);
                var harnessBytes = ManagedCrystalReportContractArtifact.ReadAllBytes();
                Assert(sourceBytes.SequenceEqual(harnessBytes),
                    "Harness resource bytes differ from the canonical artifact.");

                var runtimeAssembly = Assembly.LoadFrom(args[1]);
                byte[] runtimeBytes;
                using (var resource = runtimeAssembly.GetManifestResourceStream(
                    ManagedCrystalReportContractArtifact.ResourceName))
                {
                    Assert(resource != null, "Runtime assembly contract resource is missing.");
                    using (var buffer = new MemoryStream())
                    {
                        resource.CopyTo(buffer);
                        runtimeBytes = buffer.ToArray();
                    }
                }
                Assert(sourceBytes.SequenceEqual(runtimeBytes),
                    "Runtime assembly resource bytes differ from the canonical artifact.");

                var registry = CrystalReportProfileRegistry.CreateDefault();
                Assert(registry.SchemaVersion == 1, "Schema version must be 1.");
                Assert(registry.Count == 5, "Exactly five entity profiles are required.");
                Assert(registry.Fingerprint == ComputeSha256(sourceBytes),
                    "Registry fingerprint is not the SHA-256 of the exact artifact bytes.");

                var countries = registry.GetRequired("COUNTRIES");
                Assert(countries.Scope == "global", "Countries must remain global.");
                Assert(countries.MaximumRows == 10000, "Countries row limit mismatch.");

                var fiscalYears = registry.GetRequired("fiscalyears");
                Assert(fiscalYears.Scope == "tenant-company",
                    "Fiscal Years must remain tenant/company scoped.");
                Assert(fiscalYears.TableName == "ReportData", "Fiscal Years table mismatch.");
                Assert(fiscalYears.Columns.Count == 16, "Fiscal Years must have 16 columns.");
                Assert(fiscalYears.Columns.Take(8).All(column => !column.Nullable),
                    "Fiscal Year fields must be required.");
                Assert(fiscalYears.Columns.Skip(8).All(column => column.Nullable),
                    "Fiscal Period fields must be nullable.");
                Assert(fiscalYears.Filters.SequenceEqual(new[] { "Code", "NameAr", "NameEn" }),
                    "Fiscal Years filters mismatch.");
                Assert(fiscalYears.Parameters.Count == 1 &&
                       fiscalYears.Parameters[0].AllowedValues.SequenceEqual(new[] { "ar", "en" }),
                    "Managed Language parameter mismatch.");

                AssertThrows<UnsupportedCrystalReportProfileException>(
                    () => registry.GetRequired("unknown"),
                    "Unknown entity lookup must fail closed.");
                AssertInvalid(sourceBytes, "\"schemaVersion\": 1", "\"schemaVersion\": 2");
                AssertInvalid(sourceBytes, "\"entityKey\": \"states\"", "\"entityKey\": \"countries\"");
                AssertInvalid(sourceBytes, "\"scope\": \"global\"", "\"scope\": \"unsupported\"");
                AssertInvalid(sourceBytes, "\"maxRows\": 10000", "\"maxRows\": 0");
                AssertInvalid(sourceBytes, "\"type\": \"int32\"", "\"type\": \"decimal\"");
                AssertInvalid(sourceBytes, "\"allowMultipleValues\": false", "\"allowMultipleValues\": true");

                var validTemplate = CreateMetadata(countries);
                Assert(CrystalReportTemplateContractValidator.Validate(validTemplate, countries).IsValid,
                    "Exact template metadata must pass validation.");

                var reorderedFields = validTemplate.Tables[0].Fields.Reverse().ToArray();
                Assert(
                    CrystalReportTemplateContractValidator.Validate(
                        new CrystalReportTemplateMetadata(
                            new[] { new CrystalReportTemplateTable("ReportData", reorderedFields) },
                            validTemplate.Parameters),
                        countries).Failure == CrystalReportTemplateValidationFailure.SchemaMismatch,
                    "Reordered template fields must fail schema validation.");

                var wrongType = validTemplate.Tables[0].Fields
                    .Select((field, index) => index == 0
                        ? new CrystalReportTemplateField(field.Name, "string")
                        : field)
                    .ToArray();
                Assert(
                    CrystalReportTemplateContractValidator.Validate(
                        new CrystalReportTemplateMetadata(
                            new[] { new CrystalReportTemplateTable("ReportData", wrongType) },
                            validTemplate.Parameters),
                        countries).Failure == CrystalReportTemplateValidationFailure.SchemaMismatch,
                    "Wrong template field types must fail schema validation.");

                var multipleLanguage = new CrystalReportTemplateParameter(
                    "Language", "string", true, true, true, false, new[] { "ar", "en" });
                Assert(
                    CrystalReportTemplateContractValidator.Validate(
                        new CrystalReportTemplateMetadata(
                            validTemplate.Tables,
                            new[] { multipleLanguage }),
                        countries).Failure == CrystalReportTemplateValidationFailure.ParameterMismatch,
                    "Multiple-value Language parameters must fail validation.");

                var extraParameter = new CrystalReportTemplateParameter(
                    "Extra", "string", true, false, true, false, new[] { "x" });
                Assert(
                    CrystalReportTemplateContractValidator.Validate(
                        new CrystalReportTemplateMetadata(
                            validTemplate.Tables,
                            validTemplate.Parameters.Concat(new[] { extraParameter }).ToArray()),
                        countries).Failure == CrystalReportTemplateValidationFailure.ParameterMismatch,
                    "Additional managed parameters must fail validation.");

                var editableLanguage = new CrystalReportTemplateParameter(
                    "Language", "string", true, false, true, true, new[] { "ar", "en" });
                Assert(
                    CrystalReportTemplateContractValidator.Validate(
                        new CrystalReportTemplateMetadata(
                            validTemplate.Tables,
                            new[] { editableLanguage }),
                        countries).Failure == CrystalReportTemplateValidationFailure.ParameterMismatch,
                    "Language parameters that allow custom values must fail validation.");

                Console.WriteLine(
                    "Managed Crystal runtime contract harness passed. fingerprint=" +
                    registry.Fingerprint);
                return 0;
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine(exception.ToString());
                return 1;
            }
        }

        private static void AssertInvalid(byte[] sourceBytes, string oldValue, string newValue)
        {
            var json = Encoding.UTF8.GetString(sourceBytes);
            var index = json.IndexOf(oldValue, StringComparison.Ordinal);
            Assert(index >= 0, "Mutation source text was not found: " + oldValue);
            var mutated = json.Substring(0, index) + newValue +
                          json.Substring(index + oldValue.Length);
            AssertThrows<InvalidDataException>(
                () => CrystalReportProfileRegistry.Load(Encoding.UTF8.GetBytes(mutated)),
                "Invalid artifact mutation must be rejected: " + newValue);
        }

        private static CrystalReportTemplateMetadata CreateMetadata(CrystalReportProfile profile)
        {
            return new CrystalReportTemplateMetadata(
                new[]
                {
                    new CrystalReportTemplateTable(
                        profile.TableName,
                        profile.Columns
                            .Select(column => new CrystalReportTemplateField(column.Name, column.Type))
                            .ToArray())
                },
                profile.Parameters
                    .Select(parameter => new CrystalReportTemplateParameter(
                        parameter.Name,
                        parameter.Type,
                        parameter.Required,
                        parameter.AllowMultipleValues,
                        parameter.DiscreteOnly,
                        false,
                        parameter.AllowedValues))
                    .ToArray());
        }

        private static string ComputeSha256(byte[] bytes)
        {
            using (var sha256 = SHA256.Create())
            {
                return BitConverter.ToString(sha256.ComputeHash(bytes))
                    .Replace("-", string.Empty)
                    .ToLowerInvariant();
            }
        }

        private static void AssertThrows<TException>(Action action, string message)
            where TException : Exception
        {
            try
            {
                action();
            }
            catch (TException)
            {
                return;
            }

            throw new InvalidOperationException(message);
        }

        private static void Assert(bool condition, string message)
        {
            if (!condition)
                throw new InvalidOperationException(message);
        }
    }
}
