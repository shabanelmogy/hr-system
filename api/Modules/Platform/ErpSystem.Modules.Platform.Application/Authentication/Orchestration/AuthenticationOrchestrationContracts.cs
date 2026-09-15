namespace ErpSystem.Modules.Platform.Application.Authentication.Orchestration;

/// <summary>
/// Authentication failures are deliberately transport-neutral. Legacy adapters
/// preserve their localized descriptions while Platform owns the orchestration seam.
/// </summary>
public enum AuthenticationErrorType
{
    None = 0,
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Unexpected,
    ServiceUnavailable
}

public sealed record AuthenticationError(
    string Code,
    string Description,
    AuthenticationErrorType Type)
{
    public static readonly AuthenticationError None =
        new(string.Empty, string.Empty, AuthenticationErrorType.None);
}

public class AuthenticationOperationResult
{
    protected AuthenticationOperationResult(bool isSuccess, AuthenticationError error)
    {
        if (isSuccess && error != AuthenticationError.None ||
            !isSuccess && error == AuthenticationError.None)
        {
            throw new InvalidOperationException("Authentication result and error state are inconsistent.");
        }

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public AuthenticationError Error { get; }

    public static AuthenticationOperationResult Success() =>
        new(true, AuthenticationError.None);

    public static AuthenticationOperationResult Failure(AuthenticationError error) =>
        new(false, error);

    public static AuthenticationOperationResult<T> Success<T>(T value) =>
        new(value, true, AuthenticationError.None);

    public static AuthenticationOperationResult<T> Failure<T>(AuthenticationError error) =>
        new(default, false, error);
}

public sealed class AuthenticationOperationResult<T>(
    T? value,
    bool isSuccess,
    AuthenticationError error) : AuthenticationOperationResult(isSuccess, error)
{
    public T Value => IsSuccess
        ? value!
        : throw new InvalidOperationException("Failure results cannot have a value.");
}

public sealed record AuthenticationCompanyOption(
    int Id,
    string CompanyCode,
    string NameAr,
    string NameEn);

public sealed record AuthenticationTenantOption(
    string Id,
    string Identifier,
    string Name);

public sealed record AuthenticationSessionResponse(
    string Id,
    string UserName,
    string FirstName,
    string LastName,
    string TenantId,
    string TenantName,
    string TenantPlanName,
    int CompanyId,
    string CompanyCode,
    string CompanyNameAr,
    string CompanyNameEn,
    string Token,
    DateTime TokenExpiration,
    string RefreshToken,
    DateTime RefreshTokenExpiration);

public abstract record AuthenticationLoginResult;

public sealed record AuthenticationAuthenticatedLoginResult(
    AuthenticationSessionResponse Response) : AuthenticationLoginResult;

public sealed record AuthenticationTenantSelectionLoginResult(
    bool IsAuthenticated,
    bool RequiresTenantSelection,
    string TenantSelectionToken,
    DateTime TenantSelectionTokenExpiration,
    IReadOnlyCollection<AuthenticationTenantOption> Tenants) : AuthenticationLoginResult;

public sealed record AuthenticationCompanySelectionLoginResult(
    bool IsAuthenticated,
    bool RequiresCompanySelection,
    string CompanySelectionToken,
    DateTime CompanySelectionTokenExpiration,
    IReadOnlyCollection<AuthenticationCompanyOption> Companies) : AuthenticationLoginResult;

public sealed record AuthenticationPasswordLoginRequest(string UserName, string Password);

public sealed record AuthenticationExternalLoginRequest(
    string ProviderKey,
    string Email,
    string FirstName,
    string LastName);

public sealed record AuthenticationTenantSelectionRequest(
    string TenantSelectionToken,
    string TenantId);

public sealed record AuthenticationCompanySelectionRequest(
    string CompanySelectionToken,
    int CompanyId);

public sealed record AuthenticationSwitchCompanyRequest(int CompanyId);

public interface IAuthenticationLoginFlow
{
    Task<AuthenticationOperationResult<AuthenticationLoginResult>> PasswordLoginAsync(
        AuthenticationPasswordLoginRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult<AuthenticationLoginResult>> ExternalLoginAsync(
        AuthenticationExternalLoginRequest request,
        CancellationToken cancellationToken = default);

    Task<AuthenticationOperationResult<AuthenticationLoginResult>> SelectTenantAsync(
        AuthenticationTenantSelectionRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SelectCompanyAsync(
        AuthenticationCompanySelectionRequest request,
        CancellationToken cancellationToken);
}

/// <summary>
/// Adapter port implemented by the module that still owns the physical ASP.NET Identity tables.
/// </summary>
public interface IAuthenticationLoginAdapter : IAuthenticationLoginFlow;

public sealed record AuthenticationRefreshRequest(string? Token, string RefreshToken);

public sealed record AuthenticationLogoutRequest(string RefreshToken);

public interface IAuthenticationSessionFlow
{
    Task<AuthenticationOperationResult> LogOutAsync(
        string refreshToken,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult<AuthenticationSessionResponse>> RefreshAsync(
        AuthenticationRefreshRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult<AuthenticationSessionResponse>> SwitchCompanyAsync(
        int companyId,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> RevokeUserSessionsAsync(
        string userId,
        CancellationToken cancellationToken = default);
}

public interface IAuthenticationSessionAdapter : IAuthenticationSessionFlow;

/// <summary>
/// Canonical refresh-session timings/retention rules. Entity mutation remains
/// inside the legacy Identity adapter while these reusable policy values belong
/// to Platform.
/// </summary>
public static class AuthenticationSessionPolicy
{
    public static readonly TimeSpan RefreshTokenLifetime = TimeSpan.FromDays(14);

    public static readonly TimeSpan InactiveTokenRetention = TimeSpan.FromHours(1);

    public static readonly TimeSpan RotatedTokenReuseGracePeriod = TimeSpan.FromSeconds(30);

    public const int MaxInactiveTokenHistory = 50;
}

public sealed record AuthenticationSessionContextRequest(
    string UserId,
    string TenantId,
    int CompanyId,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    long ExpiresAt);

public sealed record AuthenticationSessionContextResponse(
    string UserId,
    string TenantId,
    string TenantName,
    string TenantPlanName,
    int CompanyId,
    string CompanyCode,
    string CompanyNameAr,
    string CompanyNameEn,
    IReadOnlyCollection<AuthenticationCompanyOption> Companies,
    string UserName,
    string Email,
    string FirstName,
    string LastName,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<string> Permissions,
    string TenantSubscriptionStatus,
    DateTime? TenantSubscriptionEndsOn,
    bool TenantReadOnly,
    long ExpiresAt);

public sealed record AuthenticationRegisterRequest(
    string FirstName,
    string LastName,
    string UserName,
    string Email,
    string Password,
    string? ProfilePicture);

public sealed record AuthenticationConfirmEmailRequest(string UserId, string Code);

public sealed record AuthenticationResendConfirmationRequest(string Email);

public sealed record AuthenticationEmailRequest(string Email);

public sealed record AuthenticationResetPasswordRequest(
    string Email,
    string Code,
    string NewPassword);

public sealed record AuthenticationChangePasswordRequest(
    string CurrentPassword,
    string NewPassword);

public interface IAuthenticationAccountFlow
{
    Task<AuthenticationOperationResult> RegisterAsync(
        AuthenticationRegisterRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> ConfirmEmailAsync(
        AuthenticationConfirmEmailRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> ResendConfirmationEmailAsync(
        AuthenticationResendConfirmationRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> SendResetPasswordCodeAsync(
        string email,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> ResetPasswordAsync(
        AuthenticationResetPasswordRequest request,
        CancellationToken cancellationToken);

    Task<AuthenticationOperationResult> ChangePasswordAsync(
        string userId,
        AuthenticationChangePasswordRequest request,
        CancellationToken cancellationToken);
}

public interface IAuthenticationAccountAdapter : IAuthenticationAccountFlow;

/// <summary>
/// Canonical configuration contract for public account-creation behavior. Both
/// switches intentionally fail closed when configuration is absent.
/// </summary>
public sealed class AuthenticationFeatureSettings
{
    public const string SectionName = "AuthenticationFeatureSettings";

    public bool PublicSelfRegistrationEnabled { get; set; }

    public bool GoogleAutoProvisionEnabled { get; set; }

    /// <summary>
    /// Tenant used only when public self-registration is explicitly enabled.
    /// Tenant administrators normally provision users and memberships instead.
    /// </summary>
    public string? DefaultTenantId { get; set; }
}

public interface IAuthenticationFeaturePolicy
{
    bool CanSelfRegister { get; }

    bool CanAutoProvisionGoogleUsers { get; }

    string? DefaultTenantId => null;
}
