using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Abstractions;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Contracts;
using HrManagementSystem.Application.Features.Analytics.CrystalReports.Errors;
using HrManagementSystem.Domain.Analytics.CrystalReports.Entities;

namespace HrManagementSystem.Application.Features.Analytics.CrystalReports.Queries;

public sealed class GetPublishedCrystalReportsQueryHandler(
    ICrystalReportStore store,
    ICurrentPermissionChecker permissions)
    : IQueryHandler<GetPublishedCrystalReportsQuery, IReadOnlyList<CrystalReportListItemResponse>>
{
    public Task<IReadOnlyList<CrystalReportListItemResponse>> Handle(
        GetPublishedCrystalReportsQuery request, CancellationToken cancellationToken) =>
        store.ListPublishedAsync(
            request.EntityKey, request.Search, CrystalReportRight.Run,
            permissions.HasPermission(Permissions.ManageCrystalReportAccess), cancellationToken);
}

public sealed class GetCrystalReportsManagementQueryHandler(ICrystalReportStore store)
    : IQueryHandler<GetCrystalReportsManagementQuery, CrystalReportPageResponse>
{
    public Task<CrystalReportPageResponse> Handle(
        GetCrystalReportsManagementQuery request, CancellationToken cancellationToken) =>
        store.ListManagementAsync(
            request.EntityKey, request.Search, request.Status,
            request.Page, request.PageSize, cancellationToken);
}

public sealed class GetCrystalReportDetailQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportDetailQuery, Result<CrystalReportDetailResponse>>
{
    public async Task<Result<CrystalReportDetailResponse>> Handle(
        GetCrystalReportDetailQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(
            request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<CrystalReportDetailResponse>(errors.CrystalReportNotFound)
            : Result.Success(detail);
    }
}

public sealed class GetCrystalReportVersionsQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportVersionsQuery, Result<IReadOnlyList<CrystalReportVersionResponse>>>
{
    public async Task<Result<IReadOnlyList<CrystalReportVersionResponse>>> Handle(
        GetCrystalReportVersionsQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<IReadOnlyList<CrystalReportVersionResponse>>(errors.CrystalReportNotFound)
            : Result.Success(detail.Versions);
    }
}

public sealed class GetCrystalReportGrantsQueryHandler(
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetCrystalReportGrantsQuery, Result<IReadOnlyList<CrystalReportRoleGrantResponse>>>
{
    public async Task<Result<IReadOnlyList<CrystalReportRoleGrantResponse>>> Handle(
        GetCrystalReportGrantsQuery request, CancellationToken cancellationToken)
    {
        var detail = await store.GetDetailAsync(request.ReportId, true, null, true, cancellationToken);
        return detail is null
            ? Result.Failure<IReadOnlyList<CrystalReportRoleGrantResponse>>(errors.CrystalReportNotFound)
            : Result.Success(detail.Access);
    }
}

public sealed class DownloadCrystalReportQueryHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    ICurrentPermissionChecker permissions,
    CrystalReportErrors errors)
    : IQueryHandler<DownloadCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(
        DownloadCrystalReportQuery request, CancellationToken cancellationToken)
    {
        var bypass = permissions.HasPermission(Permissions.ManageCrystalReportAccess);
        if (!bypass && !await store.HasRightAsync(
                request.ReportId, CrystalReportRight.Download, cancellationToken))
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var version = await store.GetDownloadVersionAsync(
            request.ReportId, request.VersionId, cancellationToken);
        if (version is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var stream = await fileStorage.OpenReadAsync(version.StorageKey, cancellationToken);
        if (stream is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        return Result.Success(new CrystalReportDownload(
            stream, version.OriginalFileName, "application/octet-stream", version.Size));
    }
}

public sealed class RenderCrystalReportQueryHandler(
    ICrystalReportStore store,
    ICrystalReportFileStorage fileStorage,
    ICrystalReportDataSource dataSource,
    ICrystalReportRenderer renderer,
    ICurrentPermissionChecker permissions,
    CrystalReportErrors errors)
    : IQueryHandler<RenderCrystalReportQuery, Result<CrystalReportDownload>>
{
    public async Task<Result<CrystalReportDownload>> Handle(
        RenderCrystalReportQuery request, CancellationToken cancellationToken)
    {
        var bypass = permissions.HasPermission(Permissions.ManageCrystalReportAccess);
        var report = await store.GetDetailAsync(
            request.ReportId, false, CrystalReportRight.Run, bypass, cancellationToken);
        if (report is null || !report.IsPublished)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        var version = await store.GetDownloadVersionAsync(
            request.ReportId, null, cancellationToken);
        if (version is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportNotFound);

        await using var source = await fileStorage.OpenReadAsync(
            version.StorageKey, cancellationToken);
        if (source is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportSourceUnavailable);

        var filters = request.Filters ?? new Dictionary<string, string?>();
        var data = await dataSource.BuildAsync(
            report.EntityKey, filters, cancellationToken);
        if (data is null)
            return Result.Failure<CrystalReportDownload>(errors.CrystalReportRenderUnsupported);

        var rendered = await renderer.RenderAsync(new CrystalReportRuntimeRequest(
            report.EntityKey,
            report.ReportKey,
            version.OriginalFileName,
            version.Size,
            source,
            request.Language,
            data.Xml), cancellationToken);

        if (rendered.IsSuccess)
            return Result.Success(rendered.Report!);

        return Result.Failure<CrystalReportDownload>(
            rendered.Failure == CrystalReportRenderFailure.UnsupportedEntity
                ? errors.CrystalReportRenderUnsupported
                : errors.CrystalReportRuntimeUnavailable);
    }
}

public sealed class GetDiscoveredCrystalReportsQueryHandler(
    ICrystalReportLegacySource legacySource,
    ICrystalReportStore store,
    CrystalReportErrors errors)
    : IQueryHandler<GetDiscoveredCrystalReportsQuery,
        Result<IReadOnlyList<DiscoveredCrystalReportResponse>>>
{
    public async Task<Result<IReadOnlyList<DiscoveredCrystalReportResponse>>> Handle(
        GetDiscoveredCrystalReportsQuery request,
        CancellationToken cancellationToken)
    {
        var discovered = await legacySource.ListAsync(request.EntityKey, cancellationToken);
        if (discovered is null)
            return Result.Failure<IReadOnlyList<DiscoveredCrystalReportResponse>>(
                errors.CrystalReportCatalogUnavailable);

        var imported = (await store.ListIdentitiesAsync(cancellationToken))
            .Select(item => Identity(item.EntityKey, item.ReportKey))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
        var response = discovered
            .OrderBy(item => item.EntityKey, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(item => item.ReportKey, StringComparer.OrdinalIgnoreCase)
            .Select(item => new DiscoveredCrystalReportResponse(
                item.SourceId, item.EntityKey, item.ReportKey, item.FileName, item.DisplayName,
                item.Subject, item.Size, item.Sha256, item.LastModifiedUtc, item.IsImportable,
                item.ValidationReason,
                imported.Contains(Identity(item.EntityKey, item.ReportKey))))
            .ToArray();
        return Result.Success<IReadOnlyList<DiscoveredCrystalReportResponse>>(response);
    }

    private static string Identity(string entityKey, string reportKey) =>
        $"{entityKey}\u001f{reportKey}";
}
