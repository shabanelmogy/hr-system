using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Modules.Platform.Application.OfflineOperations;

public sealed record GetOfflineOperationsPolicyQuery : IQuery<OfflineOperationsPolicyResponse>;

public sealed record UpdateOfflineOperationsPolicyCommand(UpdateOfflineOperationsPolicyRequest Request)
    : ICommand<OfflineOperationsPolicyResponse>;

public sealed class GetOfflineOperationsPolicyQueryHandler(
    ICurrentExecutionContext executionContext,
    IOfflineOperationsPolicyStore store)
    : IQueryHandler<GetOfflineOperationsPolicyQuery, OfflineOperationsPolicyResponse>
{
    public async Task<OfflineOperationsPolicyResponse> Handle(
        GetOfflineOperationsPolicyQuery request,
        CancellationToken cancellationToken)
    {
        var scope = OfflineOperationsPolicyUseCase.RequireScope(executionContext);
        var stored = await store.GetAsync(scope.TenantId, scope.CompanyId, cancellationToken)
            .ConfigureAwait(false);

        return OfflineOperationsPolicyUseCase.ToResponse(scope.TenantId, scope.CompanyId, stored);
    }
}

public sealed class UpdateOfflineOperationsPolicyCommandHandler(
    ICurrentExecutionContext executionContext,
    IOfflineOperationsPolicyStore store,
    TimeProvider timeProvider)
    : ICommandHandler<UpdateOfflineOperationsPolicyCommand, OfflineOperationsPolicyResponse>
{
    public async Task<OfflineOperationsPolicyResponse> Handle(
        UpdateOfflineOperationsPolicyCommand command,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(command.Request);

        var scope = OfflineOperationsPolicyUseCase.RequireScope(executionContext);
        var actorUserId = executionContext.UserId;
        if (string.IsNullOrWhiteSpace(actorUserId))
            throw new OfflineOperationsPolicyScopeException("An authenticated user is required.");

        var normalizedModes = OfflineOperationsCapabilitySafetyCatalog.ValidateReplacement(command.Request.Modes);
        var expectedRowVersion = OfflineOperationsPolicyUseCase.ParseRowVersion(command.Request.RowVersion);

        var saved = await store.SaveAsync(
            new SaveOfflineOperationsPolicyRequest(
                scope.TenantId,
                scope.CompanyId,
                normalizedModes,
                expectedRowVersion,
                timeProvider.GetUtcNow(),
                actorUserId),
            cancellationToken).ConfigureAwait(false);

        return OfflineOperationsPolicyUseCase.ToResponse(scope.TenantId, scope.CompanyId, saved);
    }
}

internal static class OfflineOperationsPolicyUseCase
{
    public static (string TenantId, int CompanyId) RequireScope(ICurrentExecutionContext executionContext)
    {
        var tenantId = executionContext.TenantId?.Trim();
        if (string.IsNullOrWhiteSpace(tenantId))
            throw new OfflineOperationsPolicyScopeException("A selected tenant is required.");

        var companyId = executionContext.CompanyId;
        if (companyId is null or <= 0)
            throw new OfflineOperationsPolicyScopeException("A selected company is required.");

        return (tenantId, companyId.Value);
    }

    public static OfflineOperationsPolicyResponse ToResponse(
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

    public static byte[]? ParseRowVersion(string? rowVersion)
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
