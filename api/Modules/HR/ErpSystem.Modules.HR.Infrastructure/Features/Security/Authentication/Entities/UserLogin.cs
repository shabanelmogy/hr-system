using ErpSystem.Modules.HR.Domain.Common.Abstractions;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;

public class UserLogin : ICompanyScoped
{
    public string TenantId { get; set; } = string.Empty;
    public int CompanyId { get; set; }
    public string? Id { get; set; }
    public required string? UserId { get; set; }
    public ApplicationUser? User { get; set; }
    public required DateTime LoginDate { get; set; }
    public DateTime? LogOutDate { get; set; }
}
