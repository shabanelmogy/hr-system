namespace ErpSystem.Modules.Platform.Domain.Security.Users.Entities;

/// <summary>Company-scoped additive business permissions for one tenant user.</summary>
public sealed class UserCompanyPermissionGrantSet : ErpSystem.BuildingBlocks.Domain.Abstractions.ICompanyScoped
{
    private readonly List<UserCompanyPermissionGrant> _grants = [];
    private UserCompanyPermissionGrantSet() { }

    public UserCompanyPermissionGrantSet(string tenantId, int companyId, string userId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(tenantId);
        ArgumentException.ThrowIfNullOrWhiteSpace(userId);
        if (tenantId.Length > 32 || userId.Length > 450)
            throw new ArgumentException("The scope identifier is too long.");
        if (companyId <= 0) throw new ArgumentOutOfRangeException(nameof(companyId));
        TenantId = tenantId;
        CompanyId = companyId;
        UserId = userId;
    }

    public int Id { get; private set; }
    public string TenantId { get; private set; } = string.Empty;
    public int CompanyId { get; private set; }
    public string UserId { get; private set; } = string.Empty;
    public int Revision { get; private set; }
    public byte[] RowVersion { get; private set; } = [];
    public IReadOnlyCollection<UserCompanyPermissionGrant> Grants => _grants;

    string ErpSystem.BuildingBlocks.Domain.Abstractions.ITenantScoped.TenantId
    {
        get => TenantId;
        set => TenantId = value;
    }

    int ErpSystem.BuildingBlocks.Domain.Abstractions.ICompanyScoped.CompanyId
    {
        get => CompanyId;
        set => CompanyId = value;
    }

    public bool Replace(IReadOnlyCollection<string> permissions, int expectedRevision)
    {
        ArgumentNullException.ThrowIfNull(permissions);
        if (permissions.Count > 2000 || permissions.Any(permission =>
                string.IsNullOrWhiteSpace(permission) || permission.Length > 200 ||
                permission != permission.Trim() || permission.Count(character => character == ':') != 1 ||
                permission.StartsWith(':') || permission.EndsWith(':')) ||
            permissions.Distinct(StringComparer.Ordinal).Count() != permissions.Count)
            throw new ArgumentException("Permissions must be distinct exact Resource:Action identifiers.", nameof(permissions));
        if (expectedRevision != Revision)
            throw new InvalidOperationException("The company user permissions changed. Reload and try again.");
        var desired = permissions.Order(StringComparer.Ordinal).ToArray();
        if (_grants.Select(item => item.Permission).Order(StringComparer.Ordinal)
            .SequenceEqual(desired, StringComparer.Ordinal))
            return false;
        _grants.Clear();
        _grants.AddRange(desired.Select(permission => new UserCompanyPermissionGrant(permission)));
        Revision = checked(Revision + 1);
        return true;
    }
}

public sealed class UserCompanyPermissionGrant
{
    private UserCompanyPermissionGrant() { }
    internal UserCompanyPermissionGrant(string permission) => Permission = permission;
    public int Id { get; private set; }
    public string Permission { get; private set; } = string.Empty;
}
