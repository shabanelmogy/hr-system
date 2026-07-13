using HrManagementSystem.Features.GeographicalInformation.Addresses.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Districts.Entities;

public class District : AuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } =null!;
    public string NameAr { get; set; } =null!;
    public string Code { get; set; } = string.Empty;
    public int StateId { get; set; }
    public State State { get; set; } = null!;
    public ICollection<Address> Addresses { get; set; } = [];
}
