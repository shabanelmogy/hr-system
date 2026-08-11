using HrManagementSystem.Application.Features.Analytics.Reports.Abstractions;

namespace HrManagementSystem.Infrastructure.Features.Analytics.Reports.Persistence;

public sealed class ReportValidationQueries(ApplicationDbContext context)
    : IReportValidationQueries
{
    public Task<bool> ReportCategoryNameExistsAsync(
        string name,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.ReportsCategories.AnyAsync(
            category => category.Name == name &&
                        (!excludedId.HasValue || category.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> ReportDetailPropertyNameExistsAsync(
        string propertyName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.ReportsDetails.AnyAsync(
            detail => detail.PropertyName == propertyName &&
                      detail.ReportMasterId == reportMasterId &&
                      (!excludedId.HasValue || detail.Id != excludedId.Value),
            cancellationToken);

    public Task<bool> ReportDetailColumnNameExistsAsync(
        string columnName,
        int reportMasterId,
        int? excludedId,
        CancellationToken cancellationToken) =>
        context.ReportsDetails.AnyAsync(
            detail => detail.ColumnName == columnName &&
                      detail.ReportMasterId == reportMasterId &&
                      (!excludedId.HasValue || detail.Id != excludedId.Value),
            cancellationToken);
}
