namespace HrManagementSystem.Infrastructure.Security.Authorization.Filters
{
    public class HasPermissionAttribute(string permission) : AuthorizeAttribute(permission)
    {
    }
}