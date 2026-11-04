using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record GetGlobalCrystalReportRolesQuery(string EntityKey, string? Search = null, int Page = 1, int PageSize = 10)
    : IQuery<Result<PlatformRoleScopePage>>;
public sealed record GetGlobalCrystalReportAccessQuery(Guid ReportId) : IQuery<Result<GlobalCrystalReportAccessResponse>>;

public sealed class GetGlobalCrystalReportRolesQueryValidator : AbstractValidator<GetGlobalCrystalReportRolesQuery>
{
    public GetGlobalCrystalReportRolesQueryValidator()
    {
        RuleFor(x => x.EntityKey).Must(key => key is "countries" or "states" or "districts");
        RuleFor(x => x.Search).MaximumLength(200);
        RuleFor(x => x.Page).InclusiveBetween(1, 100000);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
