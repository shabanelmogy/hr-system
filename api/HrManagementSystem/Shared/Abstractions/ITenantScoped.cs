namespace HrManagementSystem.Shared.Abstractions;

public interface ITenantScoped
{
    string TenantId { get; set; }
}
