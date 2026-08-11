using static HrManagementSystem.Domain.Common.Guards.DomainGuard;

namespace HrManagementSystem.Domain.Tenancy.Entities;

public sealed class Tenant
{
    private Tenant()
    {
    }

    public Tenant(string id, string identifier, string name, DateTime createdOn)
    {
        Id = Required(id, nameof(id));
        Identifier = Required(identifier, nameof(identifier));
        Name = Required(name, nameof(name));
        CreatedOn = createdOn;
        IsActive = true;
    }

    public string Id { get; private set; } = string.Empty;
    public string Identifier { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTime CreatedOn { get; private set; }

    public void Rename(string name) => Name = Required(name, nameof(name));

    public void Activate() => IsActive = true;

    public void Deactivate() => IsActive = false;
}
