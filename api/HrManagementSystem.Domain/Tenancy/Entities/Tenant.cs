namespace HrManagementSystem.Domain.Tenancy.Entities;

public sealed class Tenant
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Identifier { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}
