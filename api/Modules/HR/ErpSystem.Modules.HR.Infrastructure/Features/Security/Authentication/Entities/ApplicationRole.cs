namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities
{
    [ErpSystem.Modules.HR.Application.Common.Realtime.RealtimeResourceName("roles")]
    public class ApplicationRole : IdentityRole
    {
        public ApplicationRole() { }

        public ApplicationRole(string role) : base(role) { }

        public string? TenantId { get; set; }
        public bool IsSystem { get; set; }
        public bool IsDefault { get; set; }
        public bool IsDeleted { get; set; }
    }
}
