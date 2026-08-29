using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Districts.Entities;

namespace HrManagementSystem.Domain.GeographicalInformation.States.Entities;

public class State : AuditableEntity
{
    public int Id { get; set; }
    public string NameAr { get; set; } = null!;
    public string NameEn { get; set; } = null!;
    public string Code { get; set; } = string.Empty;
    public int CountryId { get; set; }
    public Country? Country { get; set; }
    public virtual ICollection<District> Districts { get; set; } = [];
    public virtual ICollection<Address> Addresses { get; set; } = [];
}
