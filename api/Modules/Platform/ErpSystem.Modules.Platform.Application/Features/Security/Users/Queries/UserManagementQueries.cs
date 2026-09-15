using ErpSystem.Modules.Platform.Application.Features.Security.Users.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.Users.Errors;

namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Queries;

public sealed record GetUsersPageQuery(UserManagementQuery Request)
    : IQuery<PageResponse<UserResponse>>;

public sealed record GetAllUsersQuery : IQuery<IReadOnlyList<UserResponse>>;

public sealed record GetUserCompanyOptionsQuery
    : IQuery<IReadOnlyCollection<UserCompanyOptionResponse>>;

public sealed record GetUserByIdQuery(string Id) : IQuery<Result<UserResponse>>;

public sealed class GetUsersPageQueryHandler(IUserManagementReadStore store)
    : IQueryHandler<GetUsersPageQuery, PageResponse<UserResponse>>
{
    public Task<PageResponse<UserResponse>> Handle(
        GetUsersPageQuery request,
        CancellationToken cancellationToken) =>
        store.GetPageAsync(request.Request, cancellationToken);
}

public sealed class GetAllUsersQueryHandler(IUserManagementReadStore store)
    : IQueryHandler<GetAllUsersQuery, IReadOnlyList<UserResponse>>
{
    public Task<IReadOnlyList<UserResponse>> Handle(
        GetAllUsersQuery request,
        CancellationToken cancellationToken) =>
        store.GetAllAsync(cancellationToken);
}

public sealed class GetUserCompanyOptionsQueryHandler(IUserManagementReadStore store)
    : IQueryHandler<GetUserCompanyOptionsQuery, IReadOnlyCollection<UserCompanyOptionResponse>>
{
    public Task<IReadOnlyCollection<UserCompanyOptionResponse>> Handle(
        GetUserCompanyOptionsQuery request,
        CancellationToken cancellationToken) =>
        store.GetCompanyOptionsAsync(cancellationToken);
}

public sealed class GetUserByIdQueryHandler(
    IUserManagementReadStore store,
    UserErrors errors)
    : IQueryHandler<GetUserByIdQuery, Result<UserResponse>>
{
    public async Task<Result<UserResponse>> Handle(
        GetUserByIdQuery request,
        CancellationToken cancellationToken)
    {
        var user = await store.GetByIdAsync(request.Id, cancellationToken);
        return user is null
            ? Result.Failure<UserResponse>(errors.UserNotFound)
            : Result.Success(user);
    }
}
