using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed record DownloadPublishedGlobalCrystalReportQuery(string SourceId, string EntityKey, string ExpectedSha256)
    : IQuery<Result<CrystalReportDownload>>;

public sealed class DownloadPublishedGlobalCrystalReportQueryValidator : AbstractValidator<DownloadPublishedGlobalCrystalReportQuery>
{
    public DownloadPublishedGlobalCrystalReportQueryValidator()
    {
        RuleFor(x => x.SourceId).Matches("^[a-f0-9]{64}$");
        RuleFor(x => x.ExpectedSha256).Matches("^[a-f0-9]{64}$");
        RuleFor(x => x.EntityKey).Must(key => key is "countries" or "states" or "districts");
    }
}

public sealed class DownloadPublishedGlobalCrystalReportQueryHandler(GlobalCrystalReportConsumerPolicy policy,
    IGlobalCrystalReportStore store, IGlobalCrystalReportConsumptionStore consumers, IGlobalCrystalReportIdentity identities,
    IManagedCrystalReportContractSource contracts, ICrystalReportFileStorage files, CrystalReportErrors errors)
    : IQueryHandler<DownloadPublishedGlobalCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(DownloadPublishedGlobalCrystalReportQuery request, CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, download: true)) return Result.Failure<CrystalReportDownload>(errors.GlobalCrystalReportForbidden);
        var reports = policy.PlatformReader ? await store.CatalogAsync(request.EntityKey, cancellationToken)
            : await consumers.CatalogAsync(request.EntityKey, CrystalReportRight.Download, cancellationToken);
        var report = reports.SingleOrDefault(item => identities.SourceId(item.ReportId) == request.SourceId);
        var version = report?.PublishedVersion;
        if (version == null || !version.IsValidFor(contracts.Fingerprint)) return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);
        if (identities.Token(version.Id, contracts.Fingerprint, version.Sha256) != request.ExpectedSha256)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportDeploymentSourceChanged);
        var content = await files.OpenVerifiedReadAsync(version.StorageKey, version.Size, version.Sha256, cancellationToken);
        return content == null ? Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable)
            : Result.Success(new CrystalReportDownload(content, version.OriginalFileName, "application/octet-stream", version.Size));
    }
}
