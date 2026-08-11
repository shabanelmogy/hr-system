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
        public bool IsDisabled { get; private set; }
        public string? ProfilePicture { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = [];
        public ICollection<UserCompanyAccess> CompanyAccesses { get; set; } = [];

        public void Disable() => IsDisabled = true;

        public void Enable() => IsDisabled = false;
    }
}
