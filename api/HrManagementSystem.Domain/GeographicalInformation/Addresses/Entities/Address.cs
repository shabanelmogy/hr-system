using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;

public class Address : CompanyAuditableEntity
{
    public int Id { get; set; }
    public int CountryId { get; set; }
    public Country? Country { get; set; }
    public int? StateId { get; set; }
    public State? State { get; set; }
    public int? DistrictId { get; set; }
    public District? District { get; set; }
    public string? City { get; set; }
    public string? StreetLine1 { get; set; }
    public string? StreetLine2 { get; set; }
    public string? BuildingNumber { get; set; }
    public string? Floor { get; set; }
    public string? ApartmentNumber { get; set; }
    public string? PostalCode { get; set; }
    public string? AdditionalInfo { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public int AddressTypeId { get; set; }
    public AddressType? AddressType { get; set; }
    public ICollection<CompanyAddress> CompanyAddresses { get; set; } = [];
    public ICollection<BranchAddress> BranchAddresses { get; set; } = [];
}
