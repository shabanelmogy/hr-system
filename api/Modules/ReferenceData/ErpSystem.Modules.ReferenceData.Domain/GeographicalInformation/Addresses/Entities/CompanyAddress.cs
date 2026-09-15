namespace ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;

public sealed class CompanyAddress : CompanyAuditableEntity
{
    private CompanyAddress()
    {
    }

    public CompanyAddress(int companyId, int addressId, AddressPurpose purpose, bool isPrimary)
    {
        CompanyId = companyId;
        AddressId = addressId;
        Purpose = purpose;
        IsPrimary = isPrimary;
    }

    public int Id { get; private set; }
    public int AddressId { get; private set; }
    public Address Address { get; private set; } = null!;
    public AddressPurpose Purpose { get; private set; }
    public bool IsPrimary { get; private set; }

    public void SetPrimary(bool isPrimary) => IsPrimary = isPrimary;
}
