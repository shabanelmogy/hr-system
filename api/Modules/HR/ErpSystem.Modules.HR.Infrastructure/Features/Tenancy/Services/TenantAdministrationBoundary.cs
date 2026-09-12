using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Common.Paginations;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Contracts;
using ErpSystem.Modules.HR.Application.Features.Tenancy.Services;
using PlatformAdmin = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration;
using PlatformArchiveTenantRequest = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.ArchiveTenantRequest;
using PlatformCreateTenantAdminRequest = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.CreateTenantAdministratorRequest;
using PlatformRestoreTenantRequest = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.RestoreTenantRequest;
using PlatformTenantAdminResponse = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.TenantAdministratorResponse;
using PlatformTenantManagementRequest = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.TenantManagementRequest;
using PlatformTenantManagementResponse = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.TenantManagementResponse;
using PlatformUpdateTenantAdminRequest = ErpSystem.Modules.Platform.Contracts.Tenancy.Administration.UpdateTenantAdministratorRequest;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Tenancy.Services;

internal static class TenantAdministrationBoundaryMapper
{
    public static PlatformAdmin.TenantAdministrationResult ToPlatform(Result result) =>
        result.IsSuccess
            ? PlatformAdmin.TenantAdministrationResult.Success()
            : PlatformAdmin.TenantAdministrationResult.Failure(ToPlatform(result.Error));

    public static PlatformAdmin.TenantAdministrationResult<TPlatform> ToPlatform<THr, TPlatform>(
        Result<THr> result,
        Func<THr, TPlatform> map) =>
        result.IsSuccess
            ? PlatformAdmin.TenantAdministrationResult.Success(map(result.Value))
            : PlatformAdmin.TenantAdministrationResult.Failure<TPlatform>(ToPlatform(result.Error));

    public static Result ToHr(PlatformAdmin.TenantAdministrationResult result) =>
        result.IsSuccess
            ? Result.Success()
            : Result.Failure(ToHr(result.Error));

    public static Result<THr> ToHr<TPlatform, THr>(
        PlatformAdmin.TenantAdministrationResult<TPlatform> result,
        Func<TPlatform, THr> map) =>
        result.IsSuccess
            ? Result.Success(map(result.Value))
            : Result.Failure<THr>(ToHr(result.Error));

    public static PlatformAdmin.TenantAdministrationPage<TPlatform> ToPlatform<THr, TPlatform>(
        PageResponse<THr> page,
        Func<THr, TPlatform> map) =>
        new(
            page.Items.Select(map).ToArray(),
            new PlatformAdmin.TenantAdministrationPageMetadata(
                page.MetaData.CurrentPage,
                page.MetaData.TotalPages,
                page.MetaData.PageSize,
                page.MetaData.PageNumber,
                page.MetaData.TotalCount,
                page.MetaData.HasPrev,
                page.MetaData.HasNext));

    public static PageResponse<THr> ToHr<TPlatform, THr>(
        PlatformAdmin.TenantAdministrationPage<TPlatform> page,
        Func<TPlatform, THr> map) =>
        new(
            page.Items.Select(map).ToArray(),
            new MetaData
            {
                CurrentPage = page.MetaData.CurrentPage,
                TotalPages = page.MetaData.TotalPages,
                PageSize = page.MetaData.PageSize,
                PageNumber = page.MetaData.PageNumber,
                TotalCount = page.MetaData.TotalCount
            });

    public static PlatformAdmin.TenantAdministrationPageRequest ToPlatform(TenantManagementQuery request) =>
        new(
            request.PageNumber,
            request.PageSize,
            request.ColumnName,
            request.Operation,
            request.SortDirection,
            request.SearchValue,
            request.IncludeArchived);

    public static PlatformAdmin.TenantAdministrationPageRequest ToPlatform(TenantAdminQuery request) =>
        new(
            request.PageNumber,
            request.PageSize,
            request.ColumnName,
            request.Operation,
            request.SortDirection,
            request.SearchValue,
            request.IncludeArchived);

    public static PlatformTenantManagementRequest ToPlatform(TenantManagementRequest request) =>
        new(
            request.Identifier,
            request.Name,
            request.IsActive,
            request.SubscriptionStatus,
            request.SubscriptionStartedOn,
            request.SubscriptionEndsOn,
            request.PlanName,
            request.MaxAdmins,
            request.MaxUsers,
            request.BillingEmail,
            request.ContactName,
            request.ContactPhone,
            request.Notes,
            request.RowVersion,
            request.Entitlements);

    public static TenantManagementRequest ToHr(PlatformTenantManagementRequest request) =>
        new(
            request.Identifier,
            request.Name,
            request.IsActive,
            request.SubscriptionStatus,
            request.SubscriptionStartedOn,
            request.SubscriptionEndsOn,
            request.PlanName,
            request.MaxAdmins,
            request.MaxUsers,
            request.BillingEmail,
            request.ContactName,
            request.ContactPhone,
            request.Notes,
            request.RowVersion,
            request.Entitlements);

    public static PlatformTenantManagementResponse ToPlatform(TenantManagementResponse response) =>
        new(
            response.Id,
            response.Identifier,
            response.Name,
            response.IsActive,
            response.SubscriptionStatus,
            response.SubscriptionStartedOn,
            response.SubscriptionEndsOn,
            response.PlanName,
            response.MaxAdmins,
            response.MaxUsers,
            response.AdminCount,
            response.UserCount,
            response.TotalUserCount,
            response.CompanyCount,
            response.BillingEmail,
            response.ContactName,
            response.ContactPhone,
            response.Notes,
            response.CreatedOn,
            response.UpdatedOn,
            response.LifecycleStatus,
            response.ArchivedOn,
            response.ArchiveReason,
            response.PurgeScheduledOn,
            response.RowVersion,
            response.Entitlements);

    public static TenantManagementResponse ToHr(PlatformTenantManagementResponse response) =>
        new(
            response.Id,
            response.Identifier,
            response.Name,
            response.IsActive,
            response.SubscriptionStatus,
            response.SubscriptionStartedOn,
            response.SubscriptionEndsOn,
            response.PlanName,
            response.MaxAdmins,
            response.MaxUsers,
            response.AdminCount,
            response.UserCount,
            response.TotalUserCount,
            response.CompanyCount,
            response.BillingEmail,
            response.ContactName,
            response.ContactPhone,
            response.Notes,
            response.CreatedOn,
            response.UpdatedOn,
            response.LifecycleStatus,
            response.ArchivedOn,
            response.ArchiveReason,
            response.PurgeScheduledOn,
            response.RowVersion,
            response.Entitlements);

    public static PlatformArchiveTenantRequest ToPlatform(ArchiveTenantRequest request) =>
        new(request.Reason, request.PurgeScheduledOn, request.RowVersion);

    public static ArchiveTenantRequest ToHr(PlatformArchiveTenantRequest request) =>
        new(request.Reason, request.PurgeScheduledOn, request.RowVersion);

    public static PlatformRestoreTenantRequest ToPlatform(RestoreTenantRequest request) =>
        new(request.RowVersion);

    public static RestoreTenantRequest ToHr(PlatformRestoreTenantRequest request) =>
        new(request.RowVersion);

    public static PlatformCreateTenantAdminRequest ToPlatform(CreateTenantAdminRequest request) =>
        new(
            request.FirstName,
            request.LastName,
            request.UserName,
            request.Email,
            request.Password,
            request.TenantIds,
            request.DefaultTenantId);

    public static CreateTenantAdminRequest ToHr(PlatformCreateTenantAdminRequest request) =>
        new(
            request.FirstName,
            request.LastName,
            request.UserName,
            request.Email,
            request.Password,
            request.TenantIds,
            request.DefaultTenantId);

    public static PlatformUpdateTenantAdminRequest ToPlatform(UpdateTenantAdminRequest request) =>
        new(
            request.FirstName,
            request.LastName,
            request.UserName,
            request.Email,
            request.Password,
            request.IsDisabled,
            request.TenantIds,
            request.DefaultTenantId);

    public static UpdateTenantAdminRequest ToHr(PlatformUpdateTenantAdminRequest request) =>
        new(
            request.FirstName,
            request.LastName,
            request.UserName,
            request.Email,
            request.Password,
            request.IsDisabled,
            request.TenantIds,
            request.DefaultTenantId);

    public static PlatformTenantAdminResponse ToPlatform(TenantAdminResponse response) =>
        new(
            response.Id,
            response.FirstName,
            response.LastName,
            response.UserName,
            response.Email,
            response.IsDisabled,
            response.IsLocked,
            response.DefaultTenantId,
            response.Tenants.Select(tenant => new PlatformAdmin.TenantAdministratorTenantResponse(
                tenant.Id,
                tenant.Identifier,
                tenant.Name,
                tenant.IsDefault)).ToArray(),
            response.CompanyIds,
            response.LifecycleStatus,
            response.ArchivedOn,
            response.ArchiveReason);

    public static TenantAdminResponse ToHr(PlatformTenantAdminResponse response) =>
        new(
            response.Id,
            response.FirstName,
            response.LastName,
            response.UserName,
            response.Email,
            response.IsDisabled,
            response.IsLocked,
            response.DefaultTenantId,
            response.Tenants.Select(tenant => new TenantAdminTenantResponse(
                tenant.Id,
                tenant.Identifier,
                tenant.Name,
                tenant.IsDefault)).ToArray(),
            response.CompanyIds,
            response.LifecycleStatus,
            response.ArchivedOn,
            response.ArchiveReason);

    private static PlatformAdmin.TenantAdministrationError ToPlatform(Error error) =>
        new(error.Code, error.Description, error.Type switch
        {
            ErrorType.None => PlatformAdmin.TenantAdministrationErrorType.None,
            ErrorType.Validation => PlatformAdmin.TenantAdministrationErrorType.Validation,
            ErrorType.Unauthorized => PlatformAdmin.TenantAdministrationErrorType.Unauthorized,
            ErrorType.Forbidden => PlatformAdmin.TenantAdministrationErrorType.Forbidden,
            ErrorType.NotFound => PlatformAdmin.TenantAdministrationErrorType.NotFound,
            ErrorType.Conflict => PlatformAdmin.TenantAdministrationErrorType.Conflict,
            ErrorType.Unexpected => PlatformAdmin.TenantAdministrationErrorType.Unexpected,
            ErrorType.ServiceUnavailable => PlatformAdmin.TenantAdministrationErrorType.ServiceUnavailable,
            _ => throw new ArgumentOutOfRangeException(nameof(error), error.Type, null)
        });

    private static Error ToHr(PlatformAdmin.TenantAdministrationError error) =>
        new(error.Code, error.Description, error.Type switch
        {
            PlatformAdmin.TenantAdministrationErrorType.None => ErrorType.None,
            PlatformAdmin.TenantAdministrationErrorType.Validation => ErrorType.Validation,
            PlatformAdmin.TenantAdministrationErrorType.Unauthorized => ErrorType.Unauthorized,
            PlatformAdmin.TenantAdministrationErrorType.Forbidden => ErrorType.Forbidden,
            PlatformAdmin.TenantAdministrationErrorType.NotFound => ErrorType.NotFound,
            PlatformAdmin.TenantAdministrationErrorType.Conflict => ErrorType.Conflict,
            PlatformAdmin.TenantAdministrationErrorType.Unexpected => ErrorType.Unexpected,
            PlatformAdmin.TenantAdministrationErrorType.ServiceUnavailable => ErrorType.ServiceUnavailable,
            _ => throw new ArgumentOutOfRangeException(nameof(error), error.Type, null)
        });
}

/// <summary>
/// Explicit Platform port over the legacy HR tenant tables. All EF transaction,
/// rowVersion, entitlement and audit semantics remain in the legacy implementation.
/// </summary>
public sealed class LegacyHrTenantManagementAdapter(
    TenantManagementService legacyService) : PlatformAdmin.ITenantManagementAdapter
{
    public async Task<PlatformAdmin.TenantAdministrationPage<PlatformTenantManagementResponse>> GetPageAsync(
        PlatformAdmin.TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.GetPageAsync(new TenantManagementQuery
            {
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                ColumnName = request.ColumnName,
                Operation = request.Operation,
                SortDirection = request.SortDirection,
                SearchValue = request.SearchValue,
                IncludeArchived = request.IncludeArchived
            }, cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<IReadOnlyList<PlatformTenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        (await legacyService.GetAllAsync(cancellationToken))
            .Select(TenantAdministrationBoundaryMapper.ToPlatform)
            .ToArray();

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.GetAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantManagementResponse>> CreateAsync(
        PlatformTenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.CreateAsync(TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantManagementResponse>> UpdateAsync(
        string id,
        PlatformTenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.UpdateAsync(id, TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantManagementResponse>> ArchiveAsync(
        string id,
        PlatformArchiveTenantRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.ArchiveAsync(id, TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantManagementResponse>> RestoreAsync(
        string id,
        PlatformRestoreTenantRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.RestoreAsync(id, TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);
}

/// <summary>Explicit Platform port over legacy ASP.NET Identity tenant-administrator storage.</summary>
public sealed class LegacyHrTenantAdministratorAdapter(
    TenantAdminService legacyService) : PlatformAdmin.ITenantAdministratorAdapter
{
    public async Task<PlatformAdmin.TenantAdministrationPage<PlatformTenantAdminResponse>> GetPageAsync(
        PlatformAdmin.TenantAdministrationPageRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.GetPageAsync(new TenantAdminQuery
            {
                PageNumber = request.PageNumber,
                PageSize = request.PageSize,
                ColumnName = request.ColumnName,
                Operation = request.Operation,
                SortDirection = request.SortDirection,
                SearchValue = request.SearchValue,
                IncludeArchived = request.IncludeArchived
            }, cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<IReadOnlyList<PlatformTenantAdminResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        (await legacyService.GetAllAsync(cancellationToken))
            .Select(TenantAdministrationBoundaryMapper.ToPlatform)
            .ToArray();

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantAdminResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.GetAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantAdminResponse>> CreateAsync(
        PlatformCreateTenantAdminRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.CreateAsync(TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantAdminResponse>> UpdateAsync(
        string id,
        PlatformUpdateTenantAdminRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.UpdateAsync(id, TenantAdministrationBoundaryMapper.ToHr(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);

    public async Task<PlatformAdmin.TenantAdministrationResult> ArchiveAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.DeleteAsync(id, cancellationToken));

    public async Task<PlatformAdmin.TenantAdministrationResult<PlatformTenantAdminResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToPlatform(
            await legacyService.RestoreAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToPlatform);
}

/// <summary>
/// Wire-compatible facade retained for HR presentation while Platform owns the
/// application orchestration seam.
/// </summary>
public sealed class PlatformTenantManagementCompatibilityService(
    PlatformAdmin.ITenantManagementOrchestrator orchestrator) : ITenantManagementService
{
    public async Task<PageResponse<TenantManagementResponse>> GetPageAsync(
        TenantManagementQuery request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.GetPageAsync(TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        (await orchestrator.GetAllAsync(cancellationToken))
            .Select(TenantAdministrationBoundaryMapper.ToHr)
            .ToArray();

    public async Task<Result<TenantManagementResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.GetAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantManagementResponse>> CreateAsync(
        TenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.CreateAsync(TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantManagementResponse>> UpdateAsync(
        string id,
        TenantManagementRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.UpdateAsync(id, TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantManagementResponse>> ArchiveAsync(
        string id,
        ArchiveTenantRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.ArchiveAsync(id, TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantManagementResponse>> RestoreAsync(
        string id,
        RestoreTenantRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.RestoreAsync(id, TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);
}

public sealed class PlatformTenantAdministratorCompatibilityService(
    PlatformAdmin.ITenantAdministratorOrchestrator orchestrator) : ITenantAdminService
{
    public async Task<PageResponse<TenantAdminResponse>> GetPageAsync(
        TenantAdminQuery request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.GetPageAsync(TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<IReadOnlyList<TenantAdminResponse>> GetAllAsync(
        CancellationToken cancellationToken = default) =>
        (await orchestrator.GetAllAsync(cancellationToken))
            .Select(TenantAdministrationBoundaryMapper.ToHr)
            .ToArray();

    public async Task<Result<TenantAdminResponse>> GetAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.GetAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantAdminResponse>> CreateAsync(
        CreateTenantAdminRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.CreateAsync(TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result<TenantAdminResponse>> UpdateAsync(
        string id,
        UpdateTenantAdminRequest request,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.UpdateAsync(id, TenantAdministrationBoundaryMapper.ToPlatform(request), cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);

    public async Task<Result> DeleteAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.ArchiveAsync(id, cancellationToken));

    public async Task<Result<TenantAdminResponse>> RestoreAsync(
        string id,
        CancellationToken cancellationToken = default) =>
        TenantAdministrationBoundaryMapper.ToHr(
            await orchestrator.RestoreAsync(id, cancellationToken),
            TenantAdministrationBoundaryMapper.ToHr);
}
