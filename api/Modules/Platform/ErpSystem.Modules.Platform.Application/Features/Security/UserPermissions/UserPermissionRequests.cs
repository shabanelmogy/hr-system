using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

namespace ErpSystem.Modules.Platform.Application.Features.Security.UserPermissions;

public sealed record GetUserCompanyPermissionsQuery(string UserId) : IQuery<Result<UserCompanyPermissionsResponse>>;
public sealed record ReplaceUserCompanyPermissionsCommand(string UserId, ReplaceUserCompanyPermissionsRequest Request) : ICommand<Result>;

public sealed class ReplaceUserCompanyPermissionsValidator : AbstractValidator<ReplaceUserCompanyPermissionsCommand>
{
    public ReplaceUserCompanyPermissionsValidator()
    {
        RuleFor(command => command.UserId).NotEmpty().MaximumLength(450);
        RuleFor(command => command.Request).NotNull();
        When(command => command.Request is not null, () =>
        {
            RuleFor(command => command.Request.ExpectedRevision).GreaterThanOrEqualTo(0);
            RuleFor(command => command.Request.Permissions).NotNull().Must(values => values is not null && values.Count <= 2000);
            RuleForEach(command => command.Request.Permissions).NotEmpty().MaximumLength(200);
        });
    }
}

public sealed class GetUserCompanyPermissionsHandler(
    IUserCompanyPermissionsStore store, ICurrentActor actor, UserPermissionErrors errors)
    : IQueryHandler<GetUserCompanyPermissionsQuery, Result<UserCompanyPermissionsResponse>>
{
    public async Task<Result<UserCompanyPermissionsResponse>> Handle(GetUserCompanyPermissionsQuery request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0 || string.IsNullOrWhiteSpace(request.UserId))
            return Result.Failure<UserCompanyPermissionsResponse>(errors.NotFound);
        var response = await store.GetAsync(request.UserId, actor.TenantId, actor.CompanyId.Value, cancellationToken);
        return response is null ? Result.Failure<UserCompanyPermissionsResponse>(errors.NotFound) : Result.Success(response);
    }
}

public sealed class ReplaceUserCompanyPermissionsHandler(
    IUserCompanyPermissionsStore store, ICurrentActor actor, UserPermissionErrors errors,
    IRolePostCommitEffects effects)
    : ICommandHandler<ReplaceUserCompanyPermissionsCommand, Result>
{
    public async Task<Result> Handle(ReplaceUserCompanyPermissionsCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;
        if (string.IsNullOrWhiteSpace(actor.TenantId) || actor.CompanyId is not > 0 || string.IsNullOrWhiteSpace(command.UserId) ||
            request is null || request.Permissions is null || request.ExpectedRevision < 0 || request.Permissions.Count > 2000 ||
            request.Permissions.Any(permission => string.IsNullOrWhiteSpace(permission) || permission.Length > 200 ||
                permission != permission.Trim() || permission.Count(character => character == ':') != 1 ||
                permission.StartsWith(':') || permission.EndsWith(':')) ||
            request.Permissions.Distinct(StringComparer.Ordinal).Count() != request.Permissions.Count)
            return Result.Failure(errors.Invalid);
        var result = await store.ReplaceAsync(command.UserId, actor.TenantId, actor.CompanyId.Value,
            request.Permissions, request.ExpectedRevision, cancellationToken);
        if (result.IsFailure) return Result.Failure(result.Error);
        // The store has committed before these best-effort notifications are queued.
        if (result.Value.Changed)
            effects.QueueSessionRevocations([command.UserId], "Your session was revoked because company permissions changed.");
        return Result.Success();
    }
}
