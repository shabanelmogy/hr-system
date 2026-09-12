using ErpSystem.Modules.HR.Application.Abstractions.Validation;

namespace ErpSystem.Modules.HR.Application.Features.Analytics.Reports.Abstractions;

public interface IReportValidationQueries : IValidationQuery
{
    Task<bool> ReportCategoryNameExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> ReportDetailPropertyNameExistsAsync(
        string propertyName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken);

    Task<bool> ReportDetailColumnNameExistsAsync(
        string columnName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken);
}
