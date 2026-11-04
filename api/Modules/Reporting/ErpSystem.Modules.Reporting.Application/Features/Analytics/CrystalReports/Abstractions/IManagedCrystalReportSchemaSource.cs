namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;

public interface IManagedCrystalReportSchemaSource
{
    byte[] ExportSchema(string entityKey);
}
