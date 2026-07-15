using HrManagementSystem.Features.GeographicalInformation.States.Entities;

namespace HrManagementSystem.Features.GeographicalInformation.Countries.Entities;

public class Country : AuditableEntity
{
    public int Id { get; set; }
    public string NameEn { get; set; } = null!;
    public string NameAr { get; set; } = null!;
    public string? Alpha2Code { get; set; } 
    public string? Alpha3Code { get; set; } 
    public string? PhoneCode { get; set; } 
    public string? CurrencyCode { get; set; }
    public virtual ICollection<State> States { get; set; } =[];
}
