using HrManagementSystem.Application.Common.Realtime;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Contracts;
using HrManagementSystem.Application.Features.Platform.SecurityAudits.Services;
using HrManagementSystem.Application.Features.Security.Authentication.Contracts;
using HrManagementSystem.Application.Features.Security.Users.Errors;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public sealed class AuthAccountService(
    UserManager<ApplicationUser> userManager,
    UserErrors userErrors,
    IAuthEmailService emailService,
    AuthCompanyAccessService companyAccess,
    RegistrationProfilePictureStore profilePictures,
    AuthSessionService sessions,
    ISecurityAuditService securityAudit,
    IRealtimeChangeDispatcher realtimeChanges,
    ApplicationDbContext context)
{
    public async Task<Result> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = request.Adapt<ApplicationUser>();
        user.TenantId = TenantDefaults.DefaultId;
        var result = await userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
            return Result.Failure(IdentityFailure(result));

        await companyAccess.AssignDefaultCompanyAsync(user, cancellationToken);

        if (!string.IsNullOrEmpty(request.ProfilePicture))
            await profilePictures.TrySaveAsync(user, request.ProfilePicture, cancellationToken);

        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendConfirmationEmail(user, code);
        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserRegistered",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        await DispatchUserChangeAsync(user, "Register", cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ConfirmEmailAsync(
        ConfirmEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByIdAsync(request.UserId) is not { } user)
            return Result.Failure(userErrors.InvalidCode);

        if (user.EmailConfirmed)
            return Result.Failure(userErrors.DuplicatedConfirmation);

        string code;
        try
        {
            code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
        }
        catch (FormatException)
        {
            return Result.Failure(userErrors.InvalidCode);
        }

        var result = await userManager.ConfirmEmailAsync(user, code);
        if (!result.Succeeded)
            return Result.Failure(IdentityFailure(result));

        var roleResult = await userManager.AddToRoleAsync(user, AppRoles.user);
        if (!roleResult.Succeeded)
            return Result.Failure(IdentityFailure(roleResult));

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserEmailConfirmed",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        await DispatchUserChangeAsync(user, "ConfirmEmail", cancellationToken);
        return Result.Success();
    }

    public async Task<Result> ResendConfirmationEmailAsync(
        ResendConfirmationEmailRequest request,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByEmailAsync(request.Email) is not { } user)
            return Result.Success();

        if (user.EmailConfirmed)
            return Result.Failure(userErrors.DuplicatedConfirmation);

        var code = await userManager.GenerateEmailConfirmationTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendConfirmationEmail(user, code);
        return Result.Success();
    }

    public async Task<Result> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken)
    {
        if (await userManager.FindByEmailAsync(email) is not { } user)
            return Result.Success();

        if (!user.EmailConfirmed)
            return Result.Failure(userErrors.EmailNotConfirmed);

        var code = await userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));
        emailService.SendResetPasswordEmail(user, code);
        return Result.Success();
    }

    public async Task<Result> ResetPasswordAsync(
        ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.ToUpper();
        var user = await userManager.Users
            .Include(candidate => candidate.RefreshTokens)
            .SingleOrDefaultAsync(
                candidate => candidate.NormalizedEmail == normalizedEmail,
                cancellationToken);

        if (user is null || !user.EmailConfirmed)
            return Result.Failure(userErrors.InvalidCode);

        IdentityResult resetResult;
        try
        {
            var code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Code));
            resetResult = await userManager.ResetPasswordAsync(user, code, request.NewPassword);
        }
        catch (FormatException)
        {
            resetResult = IdentityResult.Failed(userManager.ErrorDescriber.InvalidToken());
        }

        if (!resetResult.Succeeded)
        {
            var error = resetResult.Errors.First();
            return Result.Failure(new Error(error.Code, error.Description, ErrorType.Validation));
        }

        var revokeResult = await sessions.RevokeAllSessionsAsync(
            user,
            "Password was reset",
            "Your password was reset. Please sign in again.");
        if (revokeResult.IsFailure)
            return revokeResult;

        await securityAudit.RecordAsync(new SecurityAuditRequest(
            "UserPasswordReset",
            "ApplicationUser",
            user.Id,
            TenantId: user.TenantId), cancellationToken);
        return Result.Success();
    }

    private async Task DispatchUserChangeAsync(
        ApplicationUser user,
        string action,
        CancellationToken cancellationToken)
    {
        var companyId = await context.UserCompanyAccesses
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(access => access.UserId == user.Id && access.TenantId == user.TenantId)
            .OrderByDescending(access => access.IsDefault)
            .Select(access => (int?)access.CompanyId)
            .FirstOrDefaultAsync(cancellationToken);
        if (!companyId.HasValue)
            return;

        realtimeChanges.Dispatch(RealtimeChangeRequest.For<ApplicationUser>(
            RealtimeAudience.ForCompanyPermission(
                user.TenantId,
                companyId.Value,
                Permissions.ViewUsers),
            action,
            user.Id));
    }

    private static Error IdentityFailure(IdentityResult result)
    {
        var error = result.Errors.First();
        return new Error(error.Code, error.Description, ErrorType.Validation);
    }
}
