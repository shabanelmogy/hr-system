using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Abstractions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Errors;

namespace ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Queries;

public sealed record GetAllApiKeysQuery : IQuery<IReadOnlyCollection<ApiKeyResponse>>;

public sealed record GetApiKeyQuery(int Id) : IQuery<Result<ApiKeyResponse>>;

public sealed class GetAllApiKeysQueryHandler(IApiKeyReadStore store)
    : IQueryHandler<GetAllApiKeysQuery, IReadOnlyCollection<ApiKeyResponse>>
{
    public Task<IReadOnlyCollection<ApiKeyResponse>> Handle(
        GetAllApiKeysQuery request,
        CancellationToken cancellationToken) =>
        store.GetAllAsync(cancellationToken);
}

public sealed class GetApiKeyQueryHandler(IApiKeyReadStore store, ApiKeyErrors errors)
    : IQueryHandler<GetApiKeyQuery, Result<ApiKeyResponse>>
{
    public async Task<Result<ApiKeyResponse>> Handle(
        GetApiKeyQuery request,
        CancellationToken cancellationToken)
    {
        var apiKey = await store.GetByIdAsync(request.Id, cancellationToken);
        return apiKey is null
            ? Result.Failure<ApiKeyResponse>(errors.ApiKeyNotFound)
            : Result.Success(apiKey);
    }
}
