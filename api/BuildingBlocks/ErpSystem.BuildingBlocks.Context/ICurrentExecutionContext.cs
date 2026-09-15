namespace ErpSystem.BuildingBlocks.Context;

/// <summary>
/// Transport-neutral identity and scope of the actor executing the current
/// operation. Business modules may consume this contract without referencing
/// another module's authentication implementation.
/// </summary>
public interface ICurrentExecutionContext
{
    string? UserId { get; }

    string? TenantId { get; }

    int? CompanyId { get; }

    /// <summary>
    /// Host/runtime machine that originated the current operation. Business
    /// code consumes this metadata through the execution context instead of
    /// reading process environment state directly.
    /// </summary>
    string? MachineName => null;

    /// <summary>
    /// Stable request/operation correlation identifier when the current execution
    /// originated from a transport that supplies one. Background work may leave it null.
    /// </summary>
    string? CorrelationId => null;

    bool IsInRole(string role) => false;
}

public static class ExecutionContextHeaderNames
{
    public const string CorrelationId = "X-Correlation-ID";
}
