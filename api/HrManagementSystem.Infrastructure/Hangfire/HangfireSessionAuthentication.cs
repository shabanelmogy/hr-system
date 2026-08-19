using Microsoft.AspNetCore.Authentication.Cookies;

namespace HrManagementSystem.Infrastructure.Hangfire;

public static class HangfireSessionAuthentication
{
    public const string CookieName = "Hrms.Hangfire.Session";
    public const string DashboardPath = "/hangfire";
    private static readonly ChunkingCookieManager CookieManager = new();

    public static bool TryGetAccessToken(HttpRequest request, out string accessToken)
    {
        accessToken = string.Empty;

        if (!request.Path.StartsWithSegments(DashboardPath))
            return false;

        var cookieValue = CookieManager.GetRequestCookie(request.HttpContext, CookieName);
        if (string.IsNullOrWhiteSpace(cookieValue))
            return false;

        accessToken = cookieValue;
        return true;
    }

    public static void WriteAccessTokenCookie(
        HttpContext context,
        string accessToken,
        DateTimeOffset expiresAt)
    {
        CookieManager.AppendResponseCookie(
            context,
            CookieName,
            accessToken,
            new CookieOptions
            {
                Expires = expiresAt,
                HttpOnly = true,
                IsEssential = true,
                Path = DashboardPath,
                SameSite = SameSiteMode.Lax,
                Secure = true
            });
    }
}
