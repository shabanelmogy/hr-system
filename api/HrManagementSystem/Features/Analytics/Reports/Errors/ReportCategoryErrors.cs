using HrManagementSystem.Features.Analytics.Reports.Contracts;

namespace HrManagementSystem.Features.Analytics.Reports.Errors
{
    public class ReportCategoryErrors(IStringLocalizer<ReportCategoryRequest> localizer)
    {
        private readonly IStringLocalizer<ReportCategoryRequest> _localizer = localizer;

        public Error ReportCategoryNotFound =>
                new("ReportCategory.ReportCategoryNotFound", _localizer[nameof(ReportCategoryNotFound)], StatusCodes.Status400BadRequest);

    }
}
