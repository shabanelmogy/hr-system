namespace ErpSystem.Modules.Platform.Contracts.Authentication.Browser;

public static class BrowserAuthenticationDefaults
{
    public const string AccessCookie = "__Host-erp-angular-access";
    public const string RefreshCookie = "__Host-erp-angular-refresh";
    public const string AntiforgeryCookie = "__Host-erp-angular-antiforgery";
    public const string AntiforgeryHeader = "X-ERP-XSRF";
    public const string CookieAuthenticationItem = "Platform.BrowserCookieAuthentication";
    public const int MaximumAccessBytes = 14 * 1024;
    public const int MaximumCookieHeaderBytes = 16 * 1024;
    public const int ChunkSize = 3000;
    public const int MaximumChunks = 5;
}

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class BrowserAuthenticationEndpointAttribute : Attribute;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class BearerOnlyAuthenticationAttribute : Attribute;
