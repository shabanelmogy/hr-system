namespace HrManagementSystem.Infrastructure.Common.Settings;

public class AppSettings
{
    /// <summary>
    /// The public HTTPS URL shared by the web app and mobile universal links.
    /// Used to build confirmation and password-reset links with a web fallback.
    /// Never trust Request.Headers["Origin"] for this purpose.
    /// </summary>
    [Required, Url]
    public string FrontendUrl { get; set; } = string.Empty;
}
