namespace ErpSystem.Modules.HR.Domain.Common.Abstractions;

public interface ITenantScoped
{
    string TenantId { get; set; }
}
