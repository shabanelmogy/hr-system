using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed record ArchiveGlobalCrystalReportCommand(Guid ReportId, string RowVersion) : ICommand<Result>;
public sealed record ReplaceGlobalCrystalReportGrantsCommand(Guid ReportId, string RowVersion,
    IReadOnlyList<CrystalReportGrantRequest> Grants) : ICommand<Result>;
public sealed class ReplaceGlobalCrystalReportGrantsCommandValidator : AbstractValidator<ReplaceGlobalCrystalReportGrantsCommand>
{
    public ReplaceGlobalCrystalReportGrantsCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty().Must(PublishCrystalReportVersionCommandValidator.IsSqlServerRowVersion);
        RuleFor(x => x.Grants).Cascade(CascadeMode.Stop).NotNull()
            .Must(grants => grants.Count <= 100)
            .Must(grants => grants.All(grant => grant != null))
            .Must(grants => grants.Select(grant => grant.RoleId).Distinct(StringComparer.Ordinal).Count() == grants.Count);
        RuleForEach(x => x.Grants).Where(grant => grant != null).ChildRules(grant =>
        {
            grant.RuleFor(x => x.RoleId).NotEmpty().MaximumLength(450);
            grant.RuleFor(x => x.Rights).Cascade(CascadeMode.Stop).NotNull().NotEmpty()
                .Must(rights => rights.All(right => CrystalReportRules.RightNames.Contains(right, StringComparer.OrdinalIgnoreCase)));
        });
    }
}

public sealed class ArchiveGlobalCrystalReportCommandValidator : AbstractValidator<ArchiveGlobalCrystalReportCommand>
{
    public ArchiveGlobalCrystalReportCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty().Must(PublishCrystalReportVersionCommandValidator.IsSqlServerRowVersion);
    }
}

