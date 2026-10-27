namespace ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;

public sealed record UserCompanyPermissionItem(
    string Permission, string ModuleCode, string SubmoduleCode, bool IsDirect,
    IReadOnlyList<string> InheritedFrom, bool IsEffective, bool CanGrant);
public sealed record UserCompanyPermissionsResponse(
    string UserId, string UserName, int CompanyId, string CompanyName,
    int Revision, IReadOnlyList<UserCompanyPermissionItem> Permissions);
public sealed record ReplaceUserCompanyPermissionsRequest(IReadOnlyList<string> Permissions, int ExpectedRevision);
public sealed record UserCompanyPermissionMutation(bool Changed, int Revision);

public interface IUserCompanyPermissionsStore
{
    Task<UserCompanyPermissionsResponse?> GetAsync(
        string userId, string tenantId, int companyId, CancellationToken cancellationToken = default);
    Task<Result<UserCompanyPermissionMutation>> ReplaceAsync(
        string userId, string tenantId, int companyId, IReadOnlyCollection<string> permissions,
        int revision, CancellationToken cancellationToken = default);
}