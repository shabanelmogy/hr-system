using ErpSystem.Modules.Platform.Contracts.Authorization;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Dashboard.Contracts;

namespace ErpSystem.Modules.Reporting.Application.Features.Analytics.Dashboard.Queries;

public sealed record GetUsersCountQuery : IQuery<Result<UsersCountResponse>>;

public sealed class GetUsersCountQueryHandler(IPlatformAuthorizationSource platformAuthorization)
    : IQueryHandler<GetUsersCountQuery, Result<UsersCountResponse>>
{
    public async Task<Result<UsersCountResponse>> Handle(
        GetUsersCountQuery request,
        CancellationToken cancellationToken)
    {
        var count = await platformAuthorization.GetUserCountAsync(cancellationToken);
        return Result.Success(new UsersCountResponse(count));
    }
}
