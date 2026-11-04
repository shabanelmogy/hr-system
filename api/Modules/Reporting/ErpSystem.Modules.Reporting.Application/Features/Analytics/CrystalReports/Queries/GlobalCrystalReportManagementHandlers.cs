using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Errors;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Validation;
using ErpSystem.Modules.Reporting.Domain.Analytics.CrystalReports.Entities;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Queries;

public sealed class DownloadGlobalCrystalReportSchemaQueryHandler(GlobalCrystalReportPolicy policy,
    IManagedCrystalReportSchemaSource schemas, CrystalReportErrors errors)
    : IQueryHandler<DownloadGlobalCrystalReportSchemaQuery, Result<CrystalReportDownload>>
{
    public Task<Result<CrystalReportDownload>> Handle(DownloadGlobalCrystalReportSchemaQuery request, CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.DownloadGlobalCrystalReports))
            return Task.FromResult(Result.Failure<CrystalReportDownload>(errors.GlobalCrystalReportForbidden));
        var bytes = schemas.ExportSchema(request.EntityKey);
        return Task.FromResult(Result.Success(new CrystalReportDownload(new MemoryStream(bytes, false),
            request.EntityKey + ".xsd", "application/xml", bytes.LongLength)));
    }
}

public sealed class GetGlobalCrystalReportEntitiesQueryHandler(GlobalCrystalReportPolicy policy,
    IManagedCrystalReportContractSource contracts)
    : IQueryHandler<GetGlobalCrystalReportEntitiesQuery, IReadOnlyList<SupportedCrystalReportEntityResponse>>
{
    public Task<IReadOnlyList<SupportedCrystalReportEntityResponse>> Handle(GetGlobalCrystalReportEntitiesQuery request,
        CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<SupportedCrystalReportEntityResponse>>(
        contracts.EntityDescriptors.Where(entity => entity.Scope == "global" && policy.Allows(entity.EntityKey))
            .Select(entity => new SupportedCrystalReportEntityResponse(entity.EntityKey, entity.Scope, entity.Filters,
                contracts.SchemaVersion, contracts.Fingerprint)).ToArray());
}

public sealed class GetGlobalCrystalReportManagementQueryHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportManagementQuery, Result<CrystalReportPageResponse>>
{
    public async Task<Result<CrystalReportPageResponse>> Handle(GetGlobalCrystalReportManagementQuery request,
        CancellationToken cancellationToken)
    {
        var entities = policy.EditableEntities().Where(entity => string.IsNullOrEmpty(request.EntityKey) || entity == request.EntityKey).ToArray();
        return entities.Length == 0 ? Result.Failure<CrystalReportPageResponse>(errors.GlobalCrystalReportForbidden)
            : Result.Success(await store.ListAsync(entities, request.Search,
                Math.Clamp(request.Page, 1, 100000), Math.Clamp(request.PageSize, 1, 100), cancellationToken, request.Status));
    }
}

public sealed class GetGlobalCrystalReportDetailQueryHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportDetailQuery, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(GetGlobalCrystalReportDetailQuery request,
        CancellationToken cancellationToken)
    {
        if (policy.EditableEntities().Count == 0)
            return Result.Failure<CrystalReportDetailResponse>(errors.GlobalCrystalReportForbidden);
        var report = await store.DetailAsync(request.ReportId, cancellationToken);
        return report is not null && policy.Allows(report.EntityKey)
            ? Result.Success(report) : Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound);
    }
}

public sealed class DownloadGlobalCrystalReportVersionQueryHandler(IGlobalCrystalReportStore store,
    GlobalCrystalReportPolicy policy, ICrystalReportFileStorage storage, CrystalReportErrors errors, IGlobalCrystalReportAccessStore access)
    : IQueryHandler<DownloadGlobalCrystalReportVersionQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(DownloadGlobalCrystalReportVersionQuery request,
        CancellationToken cancellationToken)
    {
        if (!policy.EditableEntities().Any(key => policy.Allows(key, ReportingPermissions.DownloadGlobalCrystalReports)))
            return Result.Failure<CrystalReportDownload>(errors.GlobalCrystalReportForbidden);
        var report = await store.FindAsync(request.ReportId, cancellationToken);
        if (report is null || report.IsDeleted || !policy.Allows(report.EntityKey, ReportingPermissions.DownloadGlobalCrystalReports) ||
            !policy.AccessAdministrator && !await access.HasRightAsync(report.Id, CrystalReportRight.Download, cancellationToken))
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);
        var version = await store.VersionAsync(report.Id, request.VersionId, cancellationToken);
        if (version is null) return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);
        var content = await storage.OpenVerifiedReadAsync(version.StorageKey, version.Size, version.Sha256, cancellationToken);
        return content is null ? Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable)
            : Result.Success(new CrystalReportDownload(content, version.OriginalFileName,
                "application/octet-stream", version.Size));
    }
}

public sealed class GetGlobalCrystalReportCandidatesQueryHandler(ICrystalReportDeploymentSource source,
    IGlobalCrystalReportStore store, GlobalCrystalReportPolicy policy, CrystalReportErrors errors)
    : IQueryHandler<GetGlobalCrystalReportCandidatesQuery, Result<GlobalCrystalReportCandidatePage>>
{
    public async Task<Result<GlobalCrystalReportCandidatePage>> Handle(
        GetGlobalCrystalReportCandidatesQuery request, CancellationToken cancellationToken)
    {
        if (!policy.Allows(request.EntityKey, ReportingPermissions.CreateGlobalCrystalReports))
            return Result.Failure<GlobalCrystalReportCandidatePage>(errors.GlobalCrystalReportForbidden);
        var catalog = await source.ListAsync(request.EntityKey, cancellationToken);
        if (catalog is null) return Result.Failure<GlobalCrystalReportCandidatePage>(errors.CrystalReportCatalogUnavailable);
        var registeredKeys = (await store.CatalogAsync(request.EntityKey, cancellationToken))
            .Select(item => item.ReportKey).ToHashSet(StringComparer.Ordinal);
        var term = request.Search?.Trim();
        var candidates = catalog.Where(item => item.EntityKey == request.EntityKey)
            .Where(item => string.IsNullOrWhiteSpace(term) ||
                new[] { item.FileName, item.DisplayName, item.Subject, item.ReportKey }
                    .Any(value => value?.Contains(term, StringComparison.OrdinalIgnoreCase) == true))
            .OrderBy(item => item.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.SourceId, StringComparer.Ordinal).ToArray();
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Clamp(request.Page, 1, 100000);
        var items = candidates.Skip((page - 1) * pageSize).Take(pageSize).Select(item =>
            new DiscoveredCrystalReportResponse(item.SourceId, item.EntityKey, item.ReportKey, item.FileName,
                item.DisplayName, item.Subject, item.Size, item.Sha256, item.LastModifiedUtc, item.IsImportable,
                item.ValidationReason, registeredKeys.Contains(item.ReportKey))).ToArray();
        return Result.Success(new GlobalCrystalReportCandidatePage(items, candidates.Length));
    }
}
