namespace ErpSystem.BuildingBlocks.Context;

/// <summary>
/// Creates a trusted execution scope for non-HTTP work such as background jobs.
/// The implementation remains platform/host owned; modules only depend on this
/// small contract.
/// </summary>
public interface ICurrentExecutionContextScope
{
    IDisposable BeginScope(string userId, string tenantId, int? companyId = null);
}
