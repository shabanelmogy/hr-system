namespace HrManagementSystem.Shared.Settings;

public class AppSettings
{
    /// <summary>
    /// The base URL of the frontend application.
    /// Used to build links in confirmation and password-reset emails.
    /// Never trust Request.Headers["Origin"] for this purpose.
    /// </summary>
    public string FrontendUrl { get; set; } = string.Empty;
}
