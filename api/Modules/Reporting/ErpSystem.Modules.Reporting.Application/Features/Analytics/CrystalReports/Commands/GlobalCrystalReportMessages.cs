using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Commands;

public sealed record CreateGlobalCrystalReportCommand(string EntityKey, string? Description, FileUpload File)
    : ICommand<Result<CrystalReportDetailResponse>>;
public sealed record UploadGlobalCrystalReportVersionCommand(Guid ReportId, FileUpload File)
    : ICommand<Result<CrystalReportDetailResponse>>;
public sealed record PublishGlobalCrystalReportVersionCommand(Guid ReportId, Guid VersionId, string RowVersion)
    : ICommand<Result<CrystalReportDetailResponse>>;
public sealed record RevalidateGlobalCrystalReportVersionCommand(Guid ReportId, Guid VersionId)
    : ICommand<Result<CrystalReportDetailResponse>>;
public sealed record VerifyDatabaseGlobalCrystalReportVersionCommand(Guid ReportId, Guid VersionId, string RowVersion)
    : ICommand<Result<CrystalReportDetailResponse>>;
public sealed record InspectGlobalCrystalReportCommand(string EntityKey, FileUpload File)
    : ICommand<Result<CrystalReportInspection>>;
public sealed record ImportGlobalCrystalReportCommand(string EntityKey, string SourceId, string ExpectedSha256)
    : ICommand<Result<CrystalReportDetailResponse>>;

public sealed class CreateGlobalCrystalReportCommandValidator : AbstractValidator<CreateGlobalCrystalReportCommand>
{
    public CreateGlobalCrystalReportCommandValidator()
    {
        RuleFor(x => x.EntityKey).NotEmpty().Must(key => key is "countries" or "states" or "districts" or "system-error-logs");
        RuleFor(x => x.Description).MaximumLength(500);
        RuleFor(x => x.File).NotNull();
    }
}

public sealed class PublishGlobalCrystalReportVersionCommandValidator : AbstractValidator<PublishGlobalCrystalReportVersionCommand>
{
    public PublishGlobalCrystalReportVersionCommandValidator()
    {
        RuleFor(x => x.ReportId).NotEmpty();
        RuleFor(x => x.VersionId).NotEmpty();
        RuleFor(x => x.RowVersion).NotEmpty().Must(PublishCrystalReportVersionCommandValidator.IsSqlServerRowVersion);
    }
}

public sealed class ImportGlobalCrystalReportCommandValidator : AbstractValidator<ImportGlobalCrystalReportCommand>
{
    public ImportGlobalCrystalReportCommandValidator()
    {
        RuleFor(x => x.EntityKey).NotEmpty().Must(key => key is "countries" or "states" or "districts" or "system-error-logs");
        RuleFor(x => x.SourceId).NotEmpty().Matches("^[a-f0-9]{64}$");
        RuleFor(x => x.ExpectedSha256).NotEmpty().Matches("^[a-f0-9]{64}$");
    }
}
