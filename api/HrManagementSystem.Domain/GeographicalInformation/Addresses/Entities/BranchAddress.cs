using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

public sealed class BranchAddress : CompanyAuditableEntity
{
    private BranchAddress()
    {
    }

    public BranchAddress(int companyId, int branchId, int addressId, AddressPurpose purpose, bool isPrimary)
    {
        CompanyId = companyId;
        BranchId = branchId;
        AddressId = addressId;
        Purpose = purpose;
        IsPrimary = isPrimary;
    }

    public int Id { get; private set; }
    public int BranchId { get; private set; }
    public Branch Branch { get; private set; } = null!;
    public int AddressId { get; private set; }
    public Address Address { get; private set; } = null!;
    public AddressPurpose Purpose { get; private set; }
    public bool IsPrimary { get; private set; }

    public void SetPrimary(bool isPrimary) => IsPrimary = isPrimary;
}
