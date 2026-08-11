namespace HrManagementSystem.Domain.Common.Abstractions;

public interface ITenantScoped
{
    string TenantId { get; set; }
}
