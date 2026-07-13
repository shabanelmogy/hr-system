namespace HrManagementSystem.Infrastructure.Security.Authentication;

public static class JwtClaimNames
{
    public const string SessionId = "sid";
    public const string SecurityStamp = "security_stamp";
    public const string Scope = "scope";
    public const string RealtimeScope = "signalr";
}
