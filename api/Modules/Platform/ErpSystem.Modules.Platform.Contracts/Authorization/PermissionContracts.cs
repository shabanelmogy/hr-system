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

/// <summary>Permissions owned by the technical Platform module.</summary>
public static class PlatformPermissions
{
    public const string ViewApiKeys = "ApiKeys:View";
    public const string CreateApiKeys = "ApiKeys:Create";
    public const string EditApiKeys = "ApiKeys:Edit";
    public const string RevokeApiKeys = "ApiKeys:Revoke";

    public const string ViewBackups = "Backups:View";
    public const string CreateBackups = "Backups:Create";
    public const string RestoreBackups = "Backups:Restore";
    public const string DeleteBackups = "Backups:Delete";

    public const string ViewCompanyGeographicScope = "CompanyGeographicScope:View";
    public const string EditCompanyGeographicScope = "CompanyGeographicScope:Edit";
    public const string ViewMessageLogs = "MessageLogs:View";
    public const string ExportMessageLogs = "MessageLogs:Export";
    public const string ViewCompanyEmailTemplates = "CompanyEmailTemplates:View";
    public const string EditCompanyEmailTemplates = "CompanyEmailTemplates:Edit";
    public const string ResetCompanyEmailTemplates = "CompanyEmailTemplates:Reset";
    public const string ViewCompanyLocalizations = "CompanyLocalizations:View";
    public const string EditCompanyLocalizations = "CompanyLocalizations:Edit";
    public const string ResetCompanyLocalizations = "CompanyLocalizations:Reset";
    public const string SetCompanyLocalizationDefault = "CompanyLocalizations:SetDefault";

    public const string ViewSystemUiTexts = "SystemUiTexts:View";
    public const string EditSystemUiTexts = "SystemUiTexts:Edit";
    public const string ResetSystemUiTexts = "SystemUiTexts:Reset";
    public const string ViewSystemAuditTrail = "SystemAuditTrail:View";
    public const string ViewSystemHealth = "SystemHealth:View";
    public const string ViewSystemApiDocs = "SystemApiDocs:View";
    public const string ViewAuditTrail = "AuditTrail:View";
    public const string ViewHangfireDashboard = "Hangfire:View";
    public const string ViewErrorLogs = "ErrorLogs:View";
    public const string ViewErrorLogDetails = "ErrorLogs:ViewDetails";
    public const string ExportErrorLogs = "ErrorLogs:Export";
    public const string ViewSystemErrorLogs = "SystemErrorLogs:View";
    public const string ViewSystemErrorLogDetails = "SystemErrorLogs:ViewDetails";
    public const string ExportSystemErrorLogs = "SystemErrorLogs:Export";
    public const string ViewErrorLogSettings = "ErrorLogSettings:View";
    public const string EditErrorLogSettings = "ErrorLogSettings:Edit";

    public const string ViewLocalizations = "Localizations:View";
    public const string CreateLocalizations = "Localizations:Create";
    public const string EditLocalizations = "Localizations:Edit";
    public const string DeleteLocalizations = "Localizations:Delete";

    public const string ViewRoles = "Roles:View";
    public const string CreateRoles = "Roles:Create";
    public const string EditRoles = "Roles:Edit";
    public const string SetRoleStatus = "Roles:SetStatus";
    public const string ViewRolePermissions = "RolePermissions:View";
    public const string EditRolePermissions = "RolePermissions:Edit";

    public const string ViewUserPermissions = "UserPermissions:View";
    public const string EditUserPermissions = "UserPermissions:Edit";

    public const string ViewOfflineOperations = "OfflineOperations:View";
    public const string EditOfflineOperations = "OfflineOperations:Edit";

    public const string ViewUsers = "Users:View";
    public const string CreateUsers = "Users:Create";
    public const string EditUsers = "Users:Edit";
    public const string ResetUserPasswords = "Users:ResetPassword";
    public const string SetUserStatus = "Users:SetStatus";
    public const string UnlockUsers = "Users:Unlock";
    public const string ArchiveUsers = "Users:Archive";
    public const string RestoreUsers = "Users:Restore";

    public const string ViewUserInvitations = "UserInvitations:View";
    public const string CreateUserInvitations = "UserInvitations:Create";
    public const string ResendUserInvitations = "UserInvitations:Resend";
    public const string RevokeUserInvitations = "UserInvitations:Revoke";

    public static IReadOnlyList<string> TenantAdministration { get; } =
    [
        ViewApiKeys, CreateApiKeys, EditApiKeys, RevokeApiKeys,
        ViewCompanyGeographicScope, EditCompanyGeographicScope,
        ViewCompanyEmailTemplates, EditCompanyEmailTemplates, ResetCompanyEmailTemplates,
        ViewMessageLogs, ExportMessageLogs,
        ViewCompanyLocalizations, EditCompanyLocalizations, ResetCompanyLocalizations,
        SetCompanyLocalizationDefault,
        ViewAuditTrail,
        ViewErrorLogs, ViewErrorLogDetails, ExportErrorLogs,
        ViewLocalizations, CreateLocalizations, EditLocalizations, DeleteLocalizations,
        ViewRoles, CreateRoles, EditRoles, SetRoleStatus,
        ViewRolePermissions, EditRolePermissions,
        ViewUserPermissions, EditUserPermissions,
        ViewOfflineOperations, EditOfflineOperations,
        ViewUsers, CreateUsers, EditUsers, ResetUserPasswords, SetUserStatus, UnlockUsers,
        ArchiveUsers, RestoreUsers,
        ViewUserInvitations, CreateUserInvitations, ResendUserInvitations, RevokeUserInvitations
    ];

    public static IReadOnlyList<string> GlobalOperations { get; } =
    [
        ViewBackups, CreateBackups, RestoreBackups, DeleteBackups,
        ViewSystemUiTexts, EditSystemUiTexts, ResetSystemUiTexts,
        ViewSystemAuditTrail, ViewSystemHealth, ViewSystemApiDocs,
        ViewHangfireDashboard,
        ViewSystemErrorLogs, ViewSystemErrorLogDetails, ExportSystemErrorLogs,
        ViewErrorLogSettings, EditErrorLogSettings
    ];

    public static IReadOnlyList<string> All { get; } =
        TenantAdministration.Concat(GlobalOperations).ToArray();
}
