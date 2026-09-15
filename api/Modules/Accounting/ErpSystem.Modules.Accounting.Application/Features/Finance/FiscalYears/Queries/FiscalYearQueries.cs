using ErpSystem.BuildingBlocks.Application.Abstractions.Messaging;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Errors;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Queries;

public sealed record GetFiscalYearByIdQuery(int Id) : IQuery<Result<FiscalYearDetailResponse>>;

public sealed class GetFiscalYearByIdQueryValidator : AbstractValidator<GetFiscalYearByIdQuery>
{
    public GetFiscalYearByIdQueryValidator() => RuleFor(query => query.Id).GreaterThan(0);
}

public sealed class GetFiscalYearByIdQueryHandler(IFiscalYearReadStore readStore, FiscalYearErrors errors)
    : IQueryHandler<GetFiscalYearByIdQuery, Result<FiscalYearDetailResponse>>
{
    public async Task<Result<FiscalYearDetailResponse>> Handle(GetFiscalYearByIdQuery request, CancellationToken cancellationToken)
    {
        var response = await readStore.GetByIdAsync(request.Id, cancellationToken);
        return response is null
            ? Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotFound)
            : Result.Success(response);
    }
}

public sealed record GetFiscalYearLookupQuery : IQuery<IReadOnlyList<FiscalYearLookupResponse>>;

public sealed class GetFiscalYearLookupQueryHandler(IFiscalYearReadStore readStore)
    : IQueryHandler<GetFiscalYearLookupQuery, IReadOnlyList<FiscalYearLookupResponse>>
{
    public Task<IReadOnlyList<FiscalYearLookupResponse>> Handle(GetFiscalYearLookupQuery request, CancellationToken cancellationToken) =>
        readStore.GetLookupAsync(cancellationToken);
}
