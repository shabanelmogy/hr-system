namespace HrManagementSystem.Features.Security.Authentication.Entities
{
    public class ApplicationRole : IdentityRole
    {
        public ApplicationRole() { }

        public ApplicationRole(string role) : base(role) { }

        public bool IsDefault { get; set; }
        public bool IsDeleted { get; set; }
    }
}
