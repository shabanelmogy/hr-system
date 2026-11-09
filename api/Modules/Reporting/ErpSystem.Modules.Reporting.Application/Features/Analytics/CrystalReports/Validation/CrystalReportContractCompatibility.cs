using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

public static class CrystalReportContractCompatibility
{
    public static bool IsValidFor(this GlobalCrystalReportVersion version,
        IManagedCrystalReportContractSource contracts, string entityKey) =>
        version.ValidationContractSchemaVersion == contracts.SchemaVersion &&
        contracts.IsCompatibleFingerprint(entityKey, version.ValidationContractFingerprint) &&
        version.IsValidFor(version.ValidationContractFingerprint ?? string.Empty);

    public static bool IsValidFor(this CrystalReportVersion version,
        IManagedCrystalReportContractSource contracts, string entityKey) =>
        version.ValidationContractSchemaVersion == contracts.SchemaVersion &&
        contracts.IsCompatibleFingerprint(entityKey, version.ValidationContractFingerprint) &&
        version.IsValidFor(version.ValidationContractFingerprint ?? string.Empty);

    public static CrystalReportVersionResponse WithCurrentContract(this CrystalReportVersionResponse version,
        IManagedCrystalReportContractSource contracts, string entityKey)
    {
        var current = version.ValidationStatus == "Valid" &&
            version.ValidationContractSchemaVersion == contracts.SchemaVersion &&
            contracts.IsCompatibleFingerprint(entityKey, version.ValidationContractFingerprint);
        return version with
        {
            IsContractCurrent = current,
            ValidationStatus = version.ValidationStatus == "Valid" && !current ? "NeedsRevalidation" : version.ValidationStatus
        };
    }
}
