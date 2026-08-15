using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Domain.Security.Users.Enums;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities
{
    [RealtimeResourceName("users")]
    public class ApplicationUser : IdentityUser, ITenantScoped
    {
        public string TenantId { get; set; } = string.Empty;
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public bool IsDisabled { get; private set; }
        public UserLifecycleStatus LifecycleStatus { get; private set; }
        public DateTime? ArchivedOn { get; private set; }
        public string? ArchiveReason { get; private set; }
        public string? ProfilePicture { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = [];
        public ICollection<UserTenantAccess> TenantAccesses { get; set; } = [];
        public ICollection<UserCompanyAccess> CompanyAccesses { get; set; } = [];

        public void Disable() => IsDisabled = true;

        public void Enable() => IsDisabled = false;

        public void Archive(string reason, DateTime archivedOn)
        {
            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("An archive reason is required.", nameof(reason));

            LifecycleStatus = UserLifecycleStatus.Archived;
            ArchivedOn = archivedOn;
            ArchiveReason = reason.Trim();
            IsDisabled = true;
        }

        public void Restore()
        {
            LifecycleStatus = UserLifecycleStatus.Active;
            ArchivedOn = null;
            ArchiveReason = null;
            IsDisabled = false;
        }
    }
}
