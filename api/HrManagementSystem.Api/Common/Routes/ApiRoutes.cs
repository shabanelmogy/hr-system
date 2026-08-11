namespace HrManagementSystem.Api.Common.Routes;

public static class ApiRoutes
{
    public const string BaseRoute = "api/v{version:apiVersion}/[controller]/[action]";
    public const string BaseRoute2 = "api/v{version:apiVersion}/[controller]";
    public const string IdRoute = "{id}";
}
