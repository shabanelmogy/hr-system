namespace ErpSystem.BuildingBlocks.Domain.Abstractions;

public interface ITenantScoped
{
    string TenantId { get; set; }
}
