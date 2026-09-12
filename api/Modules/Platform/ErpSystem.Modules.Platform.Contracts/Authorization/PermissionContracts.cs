namespace ErpSystem.Modules.Platform.Contracts.Authorization;

/// <summary>Compatibility-sensitive authorization claim names.</summary>
public static class PermissionClaimNames
{
    public const string Permission = "Permissions";
}

/// <summary>Compatibility-sensitive system role names used by host authorization.</summary>
public static class PlatformRoleNames
{
    public const string SuperAdmin = "super_admin";
    public const string Admin = "admin";
    public const string User = "user";
}

/// <summary>
/// Platform-only permissions that are intentionally outside tenant module
/// entitlements. Tenant/business permissions must be declared by ModuleCatalog.
/// </summary>
public static class PlatformPermissions
{
    public const string ViewCountries = "Countries:View";
    public const string CreateCountries = "Countries:Create";
    public const string EditCountries = "Countries:Edit";
    public const string DeleteCountries = "Countries:Delete";

    public const string ViewStates = "States:View";
    public const string CreateStates = "States:Create";
    public const string EditStates = "States:Edit";
    public const string DeleteStates = "States:Delete";

    public const string ViewDistricts = "Districts:View";
    public const string CreateDistricts = "Districts:Create";
    public const string EditDistricts = "Districts:Edit";
    public const string DeleteDistricts = "Districts:Delete";

    private static readonly HashSet<string> Values =
    [
        ViewCountries, CreateCountries, EditCountries, DeleteCountries,
        ViewStates, CreateStates, EditStates, DeleteStates,
        ViewDistricts, CreateDistricts, EditDistricts, DeleteDistricts
    ];

    public static IReadOnlyList<string> GetAll() =>
        Values.Order(StringComparer.Ordinal).ToArray();

    public static bool IsPlatformPermission(string permission) =>
        !string.IsNullOrWhiteSpace(permission) && Values.Contains(permission);
}
