namespace HrManagementSystem.Application.Abstractions.Authentication;

public interface ICurrentActor
{
    string? UserId { get; }
    string? TenantId { get; }
    int? CompanyId { get; }
}
