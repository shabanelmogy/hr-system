namespace HrManagementSystem.Features.Security.Authentication.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public bool IsDisabled { get; set; }
        public bool IsLocked { get; set; }
        public string? ProfilePicture { get; set; }
        public List<RefreshToken> RefreshTokens { get; set; } = [];

    }
}
