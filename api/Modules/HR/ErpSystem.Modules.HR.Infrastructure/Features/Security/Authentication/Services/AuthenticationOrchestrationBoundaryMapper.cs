using ErpSystem.Modules.HR.Application.Common.Errors;
using ErpSystem.Modules.HR.Application.Features.Security.Authentication.Contracts;
using ErpSystem.Modules.Platform.Contracts.Authentication.Orchestration;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Services;

/// <summary>
/// Lossless mapping at the temporary legacy-HR Identity boundary. Keeping the
/// mapping here prevents Platform contracts from referencing HR wire contracts.
/// </summary>
internal static class AuthenticationOrchestrationBoundaryMapper
{
    public static AuthenticationOperationResult ToPlatform(Result result) =>
        result.IsSuccess
            ? AuthenticationOperationResult.Success()
            : AuthenticationOperationResult.Failure(ToPlatform(result.Error));

    public static AuthenticationOperationResult<TPlatform> ToPlatform<THr, TPlatform>(
        Result<THr> result,
        Func<THr, TPlatform> map) =>
        result.IsSuccess
            ? AuthenticationOperationResult.Success(map(result.Value))
            : AuthenticationOperationResult.Failure<TPlatform>(ToPlatform(result.Error));

    public static Result ToHr(AuthenticationOperationResult result) =>
        result.IsSuccess
            ? Result.Success()
            : Result.Failure(ToHr(result.Error));

    public static Result<THr> ToHr<TPlatform, THr>(
        AuthenticationOperationResult<TPlatform> result,
        Func<TPlatform, THr> map) =>
        result.IsSuccess
            ? Result.Success(map(result.Value))
            : Result.Failure<THr>(ToHr(result.Error));

    public static AuthenticationLoginResult ToPlatform(LoginResult result) =>
        result switch
        {
            AuthenticatedLoginResult authenticated =>
                new AuthenticationAuthenticatedLoginResult(ToPlatform(authenticated.Response)),
            TenantSelectionLoginResult tenant =>
                new AuthenticationTenantSelectionLoginResult(
                    tenant.Response.IsAuthenticated,
                    tenant.Response.RequiresTenantSelection,
                    tenant.Response.TenantSelectionToken,
                    tenant.Response.TenantSelectionTokenExpiration,
                    tenant.Response.Tenants
                        .Select(option => new AuthenticationTenantOption(
                            option.Id,
                            option.Identifier,
                            option.Name))
                        .ToArray()),
            CompanySelectionLoginResult company =>
                new AuthenticationCompanySelectionLoginResult(
                    company.Response.IsAuthenticated,
                    company.Response.RequiresCompanySelection,
                    company.Response.CompanySelectionToken,
                    company.Response.CompanySelectionTokenExpiration,
                    company.Response.Companies
                        .Select(ToPlatform)
                        .ToArray()),
            _ => throw new InvalidOperationException(
                $"Unknown legacy login result type '{result.GetType().FullName}'.")
        };

    public static LoginResult ToHr(AuthenticationLoginResult result) =>
        result switch
        {
            AuthenticationAuthenticatedLoginResult authenticated =>
                new AuthenticatedLoginResult(ToHr(authenticated.Response)),
            AuthenticationTenantSelectionLoginResult tenant =>
                new TenantSelectionLoginResult(new TenantSelectionRequiredResponse(
                    tenant.IsAuthenticated,
                    tenant.RequiresTenantSelection,
                    tenant.TenantSelectionToken,
                    tenant.TenantSelectionTokenExpiration,
                    tenant.Tenants
                        .Select(option => new TenantOptionResponse(
                            option.Id,
                            option.Identifier,
                            option.Name))
                        .ToArray())),
            AuthenticationCompanySelectionLoginResult company =>
                new CompanySelectionLoginResult(new CompanySelectionRequiredResponse(
                    company.IsAuthenticated,
                    company.RequiresCompanySelection,
                    company.CompanySelectionToken,
                    company.CompanySelectionTokenExpiration,
                    company.Companies
                        .Select(ToHr)
                        .ToArray())),
            _ => throw new InvalidOperationException(
                $"Unknown Platform login result type '{result.GetType().FullName}'.")
        };

    public static AuthenticationSessionResponse ToPlatform(AuthResponse response) =>
        new(
            response.Id,
            response.UserName,
            response.FirstName,
            response.LastName,
            response.TenantId,
            response.TenantName,
            response.TenantPlanName,
            response.CompanyId,
            response.CompanyCode,
            response.CompanyNameAr,
            response.CompanyNameEn,
            response.Token,
            response.TokenExpiration,
            response.RefreshToken,
            response.RefreshTokenExpiration);

    public static AuthResponse ToHr(AuthenticationSessionResponse response) =>
        new(
            response.Id,
            response.UserName,
            response.FirstName,
            response.LastName,
            response.TenantId,
            response.TenantName,
            response.TenantPlanName,
            response.CompanyId,
            response.CompanyCode,
            response.CompanyNameAr,
            response.CompanyNameEn,
            response.Token,
            response.TokenExpiration,
            response.RefreshToken,
            response.RefreshTokenExpiration);

    private static AuthenticationCompanyOption ToPlatform(CompanyOptionResponse option) =>
        new(option.Id, option.CompanyCode, option.NameAr, option.NameEn);

    private static CompanyOptionResponse ToHr(AuthenticationCompanyOption option) =>
        new(option.Id, option.CompanyCode, option.NameAr, option.NameEn);

    private static AuthenticationError ToPlatform(Error error) =>
        new(error.Code, error.Description, error.Type switch
        {
            ErrorType.None => AuthenticationErrorType.None,
            ErrorType.Validation => AuthenticationErrorType.Validation,
            ErrorType.Unauthorized => AuthenticationErrorType.Unauthorized,
            ErrorType.Forbidden => AuthenticationErrorType.Forbidden,
            ErrorType.NotFound => AuthenticationErrorType.NotFound,
            ErrorType.Conflict => AuthenticationErrorType.Conflict,
            ErrorType.Unexpected => AuthenticationErrorType.Unexpected,
            ErrorType.ServiceUnavailable => AuthenticationErrorType.ServiceUnavailable,
            _ => throw new ArgumentOutOfRangeException(nameof(error), error.Type, null)
        });

    private static Error ToHr(AuthenticationError error) =>
        new(error.Code, error.Description, error.Type switch
        {
            AuthenticationErrorType.None => ErrorType.None,
            AuthenticationErrorType.Validation => ErrorType.Validation,
            AuthenticationErrorType.Unauthorized => ErrorType.Unauthorized,
            AuthenticationErrorType.Forbidden => ErrorType.Forbidden,
            AuthenticationErrorType.NotFound => ErrorType.NotFound,
            AuthenticationErrorType.Conflict => ErrorType.Conflict,
            AuthenticationErrorType.Unexpected => ErrorType.Unexpected,
            AuthenticationErrorType.ServiceUnavailable => ErrorType.ServiceUnavailable,
            _ => throw new ArgumentOutOfRangeException(nameof(error), error.Type, null)
        });
}
