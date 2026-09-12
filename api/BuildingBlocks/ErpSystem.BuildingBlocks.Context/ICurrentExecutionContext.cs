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

    bool IsInRole(string role) => false;
}
