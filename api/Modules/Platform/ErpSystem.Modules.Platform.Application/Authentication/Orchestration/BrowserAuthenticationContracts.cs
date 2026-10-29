namespace ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

public sealed record BrowserAuthenticationSessionResponse(bool IsAuthenticated, AuthenticationSessionContextResponse User);
public sealed record BrowserAntiforgeryResponse(string RequestToken);

/// <summary>Admission is evaluated before a session is mutated/committed; not a second session owner.</summary>
public interface IAuthenticationSessionIssuanceGuard
{
    AuthenticationError? Validate(string accessToken, DateTime refreshExpiresOn);
}

/// <summary>Platform browser credential transport; HTTP details remain outside Application.</summary>
public interface IBrowserAuthenticationCookies
{
    AuthenticationRefreshRequest Read();
    void Write(AuthenticationSessionResponse session);
    void WriteAntiforgery(string cookieToken);
    void Clear();
}

public sealed class BrowserAuthenticationOptions
{
    public const string SectionName = "BrowserAuthentication";
    public List<string> AllowedOrigins { get; set; } = [];
}
