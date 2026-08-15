using HrManagementSystem.Infrastructure.Common.Settings;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthEmailLinkBuilder(IOptions<AppSettings> appSettings)
{
    private readonly Uri _publicAppBaseUri = new(
        $"{appSettings.Value.FrontendUrl.TrimEnd('/')}/",
        UriKind.Absolute);

    public string BuildConfirmationLink(string userId, string code) =>
        BuildLink("confirm-email", new Dictionary<string, string?>
        {
            ["userId"] = userId,
            ["code"] = code
        });

    public string BuildResetPasswordLink(string email, string code) =>
        BuildLink("reset-password", new Dictionary<string, string?>
        {
            ["email"] = email,
            ["code"] = code
        });

    private string BuildLink(
        string path,
        IReadOnlyDictionary<string, string?> query)
    {
        var route = new Uri(_publicAppBaseUri, path).ToString();
        return QueryHelpers.AddQueryString(route, query);
    }
}
