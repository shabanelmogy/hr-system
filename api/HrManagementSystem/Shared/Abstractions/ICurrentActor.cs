namespace HrManagementSystem.Shared.Abstractions;

public interface ICurrentActor
{
    string? UserId { get; }
    string? TenantId { get; }
    int? CompanyId { get; }
}
