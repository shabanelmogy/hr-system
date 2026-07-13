using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;

public class AddressType : AuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public ICollection<Address> Addresses { get; set; } = [];
}

// Examples
// Residential = 1,
// Commercial = 2,
// Office = 3,
// Warehouse = 4,
// Shipping = 5,
// Billing = 6,
// Emergency = 7,
// Other = 8
