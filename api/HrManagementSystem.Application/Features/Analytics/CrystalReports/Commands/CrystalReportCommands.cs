using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Validation;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Commands;

public sealed record CreateCrystalReportCommand(
    string EntityKey,
    string? Description,
    FileUpload File) : ICommand<Result<CrystalReportDetailResponse>>;

public sealed record AddCrystalReportVersionCommand(
    Guid ReportId,
    FileUpload File) : ICommand<Result<CrystalReportVersionResponse>>;

public sealed record PublishCrystalReportVersionCommand(
    Guid ReportId,
    Guid VersionId,
    string RowVersion) : ICommand<Result<CrystalReportDetailResponse>>;

public sealed record ReplaceCrystalReportGrantsCommand(
    Guid ReportId,
    string RowVersion,
    IReadOnlyCollection<CrystalReportGrantRequest> Grants)
    : ICommand<Result<IReadOnlyList<CrystalReportRoleGrantResponse>>>;

public sealed record ArchiveCrystalReportCommand(
    Guid ReportId,
    string RowVersion) : ICommand<Result>;

public sealed record ImportDiscoveredCrystalReportCommand(
    string SourceId,
    string ExpectedSha256,
    string? Description) : ICommand<Result<CrystalReportDetailResponse>>;

public sealed class CreateCrystalReportCommandValidator : AbstractValidator<CreateCrystalReportCommand>
{
    public CreateCrystalReportCommandValidator()
    {
        RuleFor(x => x.EntityKey).NotEmpty().MaximumLength(64)
            .Must(CrystalReportRules.IsValidKey);
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.File).NotNull();
    }
}

public sealed class AddCrystalReportVersionCommandValidator : AbstractValidator<AddCrystalReportVersionCommand>
{
    public AddCrystalReportVersionCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.File).NotNull();
    }
}

public sealed class PublishCrystalReportVersionCommandValidator : AbstractValidator<PublishCrystalReportVersionCommand>
{
    public PublishCrystalReportVersionCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.VersionId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty();
    }
}

public sealed class ReplaceCrystalReportGrantsCommandValidator : AbstractValidator<ReplaceCrystalReportGrantsCommand>
{
    public ReplaceCrystalReportGrantsCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty();
        RuleFor(x => x.Grants).NotNull().Must(x => x.Count <= 100);
        RuleFor(x => x.Grants).Must(grants =>
            grants.Select(x => x.RoleId).Distinct(StringComparer.Ordinal).Count() == grants.Count);
        RuleForEach(x => x.Grants).ChildRules(grant =>
        {
            grant.RuleFor(x => x.RoleId).NotEmpty().MaximumLength(450);
            grant.RuleFor(x => x.Rights).NotNull().NotEmpty()
                .Must(rights => rights.All(right =>
                    CrystalReportRules.RightNames.Contains(right, StringComparer.OrdinalIgnoreCase)));
        });
    }
}

public sealed class ArchiveCrystalReportCommandValidator : AbstractValidator<ArchiveCrystalReportCommand>
{
    public ArchiveCrystalReportCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty();
    }
}

public sealed class ImportDiscoveredCrystalReportCommandValidator
    : AbstractValidator<ImportDiscoveredCrystalReportCommand>
{
    public ImportDiscoveredCrystalReportCommandValidator()
    {
        RuleFor(x => x.SourceId).NotEmpty().Length(64)
            .Matches("^[a-fA-F0-9]{64}$");
        RuleFor(x => x.ExpectedSha256).NotEmpty().Length(64)
            .Matches("^[a-fA-F0-9]{64}$");
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
