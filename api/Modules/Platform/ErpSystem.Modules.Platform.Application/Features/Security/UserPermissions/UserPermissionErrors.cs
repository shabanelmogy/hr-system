namespace ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;

public sealed class UserPermissionErrors(IStringLocalizer<UserPermissionErrors> localizer)
{
    public Error NotFound => new("UserPermissions.NotFound", localizer["UserPermissions.NotFound"], ErrorType.NotFound);
    public Error Invalid => new("UserPermissions.Invalid", localizer["UserPermissions.Invalid"], ErrorType.Validation);
    public Error Forbidden => new("UserPermissions.Forbidden", localizer["UserPermissions.Forbidden"], ErrorType.Forbidden);
    public Error Conflict => new("UserPermissions.Conflict", localizer["UserPermissions.Conflict"], ErrorType.Conflict);
}