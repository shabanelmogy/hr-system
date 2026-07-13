namespace HrManagementSystem.Infrastructure.Security.Authentication
{
    public class GoogleAuth
    {
        public string? ClientId { get; set; }
        public string? ClientSecret { get; set; }
        public string? RedirectUri { get; set; }
        public string? TokenEndpoint { get; set; }
        public string? UserInfoEndpoint { get; set; }
        public string? AuthorizationEndpoint { get; set; }
    }
}
