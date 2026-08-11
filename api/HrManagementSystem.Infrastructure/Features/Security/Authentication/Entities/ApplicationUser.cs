using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities
{
    [RealtimeResourceName("users")]
    public class ApplicationUser : IdentityUser, ITenantScoped
    {
        public string TenantId { get; set; } = string.Empty;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public bool IsDisabled { get; set; }
        public bool IsLocked { get; set; }
        public string? ProfilePicture { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = [];
        public ICollection<UserCompanyAccess> CompanyAccesses { get; set; } = [];

    }
}
