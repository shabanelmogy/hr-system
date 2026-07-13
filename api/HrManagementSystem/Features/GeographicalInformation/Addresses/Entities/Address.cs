using HrManagementSystem.Features.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Features.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

public class Address : AuditableEntity
{
    public int Id { get; set; }
    public string BuildingNumber { get; set; } = string.Empty;
    public string Floor { get; set; }= string.Empty;
    public string ApartmentNumber { get; set; } = string.Empty;
    public string PostalCode { get; set; } = string.Empty;
    public string AdditionalInfo { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public bool IsDefault { get; set; }
    public int AddressTypeId { get; set; }
    public AddressType? AddressType { get; set; }
    public int DistrictId { get; set; }
    public District? District { get; set; }
}
