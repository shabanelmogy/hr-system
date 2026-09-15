using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Abstractions;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Contracts;
using ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Errors;

namespace ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Addresses.Queries;

public sealed record GetAddressesQuery : IQuery<IReadOnlyList<AddressResponse>>;

public sealed class GetAddressesQueryHandler(IAddressReadStore readStore)
    : IQueryHandler<GetAddressesQuery, IReadOnlyList<AddressResponse>>
{
    public Task<IReadOnlyList<AddressResponse>> Handle(GetAddressesQuery request, CancellationToken cancellationToken) =>
        readStore.GetAllAsync(cancellationToken);
}

public sealed record GetAddressByIdQuery(int Id) : IQuery<Result<AddressResponse>>;

public sealed class GetAddressByIdQueryHandler(IAddressReadStore readStore, AddressErrors errors)
    : IQueryHandler<GetAddressByIdQuery, Result<AddressResponse>>
{
    public async Task<Result<AddressResponse>> Handle(GetAddressByIdQuery request, CancellationToken cancellationToken)
    {
        var address = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return address is null
            ? Result.Failure<AddressResponse>(errors.AddressNotFound)
            : Result.Success(address);
    }
}

public sealed record GetAddressDetailsQuery(int Id) : IQuery<Result<AddressResponse>>;

public sealed class GetAddressDetailsQueryHandler(IAddressReadStore readStore, AddressErrors errors)
    : IQueryHandler<GetAddressDetailsQuery, Result<AddressResponse>>
{
    public async Task<Result<AddressResponse>> Handle(GetAddressDetailsQuery request, CancellationToken cancellationToken)
    {
        var address = await readStore.GetWithDetailsAsync(request.Id, cancellationToken);
        return address is null
            ? Result.Failure<AddressResponse>(errors.AddressNotFound)
            : Result.Success(address);
    }
}

public sealed record GetAddressCountQuery : IQuery<Result<AddressesCountResponse>>;

public sealed class GetAddressCountQueryHandler(IAddressReadStore readStore)
    : IQueryHandler<GetAddressCountQuery, Result<AddressesCountResponse>>
{
    public async Task<Result<AddressesCountResponse>> Handle(GetAddressCountQuery request, CancellationToken cancellationToken) =>
        Result.Success(new AddressesCountResponse(await readStore.CountActiveAsync(cancellationToken)));
}
