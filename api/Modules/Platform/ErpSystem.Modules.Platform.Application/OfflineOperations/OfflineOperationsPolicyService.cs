using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.OfflineOperations;

namespace ErpSystem.Modules.Platform.Application.OfflineOperations;

internal sealed class OfflineOperationsPolicyService(
    ICurrentExecutionContext executionContext,
    IOfflineOperationsPolicyStore store,
    TimeProvider timeProvider) : IOfflineOperationsPolicyService
{
    public async Task<OfflineOperationsPolicyResponse> GetCurrentAsync(
        CancellationToken cancellationToken = default)
    {
        var scope = RequireScope();
        var stored = await store.GetAsync(scope.TenantId, scope.CompanyId, cancellationToken)
            .ConfigureAwait(false);

        return ToResponse(scope.TenantId, scope.CompanyId, stored);
    }

    public async Task<OfflineOperationsPolicyResponse> UpdateCurrentAsync(
        UpdateOfflineOperationsPolicyRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var scope = RequireScope();
        var actorUserId = executionContext.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            throw new OfflineOperationsPolicyScopeException("An authenticated user is required.");

        var normalizedModes = OfflineOperationsCapabilitySafetyCatalog.ValidateReplacement(request.Modes);
        var expectedRowVersion = ParseRowVersion(request.RowVersion);

        var saved = await store.SaveAsync(
            new SaveOfflineOperationsPolicyRequest(
                scope.TenantId,
                scope.CompanyId,
                normalizedModes,
                expectedRowVersion,
                timeProvider.GetUtcNow(),
                actorUserId),
            cancellationToken).ConfigureAwait(false);

        return ToResponse(scope.TenantId, scope.CompanyId, saved);
    }

    private (string TenantId, int CompanyId) RequireScope()
    {
        var tenantId = executionContext.TenantId?.Trim();
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new OfflineOperationsPolicyScopeException("A selected tenant is required.");

        var companyId = executionContext.CompanyId;
        if (companyId is null or <= 0)
            throw new OfflineOperationsPolicyScopeException("A selected company is required.");

        return (tenantId, companyId.Value);
    }

    private static OfflineOperationsPolicyResponse ToResponse(
        string tenantId,
        int companyId,
        OfflineOperationsPolicyStoreRecord? stored)
    {
        var modes = OfflineOperationsCapabilitySafetyCatalog.NormalizeStoredModes(stored?.Modes);
        return new OfflineOperationsPolicyResponse(
            Version: 1,
            TenantId: tenantId,
            CompanyId: companyId,
            Modes: modes,
            Capabilities: OfflineOperationsCapabilitySafetyCatalog.GetDefinitions(),
            RowVersion: stored is null ? null : Convert.ToBase64String(stored.RowVersion),
            UpdatedOn: stored?.UpdatedOn,
            UpdatedByUserId: stored?.UpdatedByUserId);
    }

    private static byte[]? ParseRowVersion(string? rowVersion)
    {
        if (string.IsNullOrWhiteSpace(rowVersion))
            return null;

        try
        {
            var value = Convert.FromBase64String(rowVersion);
            if (value.Length == 0)
                throw new FormatException();
            return value;
        }
        catch (FormatException)
        {
            throw new OfflineOperationsPolicyValidationException("The policy rowVersion is invalid.");
        }
    }
}
