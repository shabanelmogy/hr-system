using ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Errors;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Currencies.Commands;

public sealed record CreateCurrencyCommand(string CurrencyCode, string NameEn, string NameAr, string Symbol)
    : CurrencyMutation(CurrencyCode, NameEn, NameAr, Symbol), ICommand<Result<CurrencyResponse>>;

public sealed record UpdateCurrencyCommand(int Id, string CurrencyCode, string NameEn, string NameAr, string Symbol, string RowVersion)
    : CurrencyMutation(CurrencyCode, NameEn, NameAr, Symbol), ICommand<Result<CurrencyResponse>>;

public sealed record ArchiveCurrencyCommand(int Id, string RowVersion) : ICommand<Result>;
public sealed record RestoreCurrencyCommand(int Id, string RowVersion) : ICommand<Result<CurrencyResponse>>;

public abstract class CurrencyMutationValidator<T> : AbstractValidator<T> where T : CurrencyMutation
{
    protected CurrencyMutationValidator()
    {
        RuleFor(command => command.CurrencyCode)
            .NotEmpty()
            .Length(3)
            .Matches("^[A-Za-z]{3}$");
        RuleFor(command => command.NameEn).NotEmpty().MaximumLength(100);
        RuleFor(command => command.NameAr).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Symbol).NotEmpty().MaximumLength(10);
    }
}

public sealed class CreateCurrencyCommandValidator : CurrencyMutationValidator<CreateCurrencyCommand>;

public sealed class UpdateCurrencyCommandValidator : CurrencyMutationValidator<UpdateCurrencyCommand>
{
    public UpdateCurrencyCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).Must(CurrencyCommandSupport.IsValidRowVersion);
    }
}

public sealed class ArchiveCurrencyCommandValidator : AbstractValidator<ArchiveCurrencyCommand>
{
    public ArchiveCurrencyCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).Must(CurrencyCommandSupport.IsValidRowVersion);
    }
}

public sealed class RestoreCurrencyCommandValidator : AbstractValidator<RestoreCurrencyCommand>
{
    public RestoreCurrencyCommandValidator()
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion).Must(CurrencyCommandSupport.IsValidRowVersion);
    }
}

public sealed class CreateCurrencyCommandHandler(
    ICurrencyWriteStore writeStore,
    ICurrencyReadStore readStore,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    CurrencyErrors errors)
    : ICommandHandler<CreateCurrencyCommand, Result<CurrencyResponse>>
{
    public async Task<Result<CurrencyResponse>> Handle(CreateCurrencyCommand request, CancellationToken cancellationToken)
    {
        if (!CurrencyCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<CurrencyResponse>(errors.CompanyContextRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [CurrencyLocks.CompanyCatalog(tenantId, companyId)],
            async token =>
            {
                var code = request.CurrencyCode.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, null, token))
                    return Result.Failure<CurrencyResponse>(errors.DuplicateCode);

                var currency = new Currency(code, request.NameEn, request.NameAr, request.Symbol)
                {
                    TenantId = tenantId,
                    CompanyId = companyId
                };
                writeStore.Add(currency);
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(currency.Id, token)
                    ?? throw new InvalidOperationException("The newly created currency could not be read.");
                return Result.Success(response);
            },
            cancellationToken);
    }
}

public sealed class UpdateCurrencyCommandHandler(
    ICurrencyWriteStore writeStore,
    ICurrencyReadStore readStore,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    CurrencyErrors errors)
    : ICommandHandler<UpdateCurrencyCommand, Result<CurrencyResponse>>
{
    public async Task<Result<CurrencyResponse>> Handle(UpdateCurrencyCommand request, CancellationToken cancellationToken)
    {
        if (!CurrencyCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<CurrencyResponse>(errors.CompanyContextRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [CurrencyLocks.CompanyCatalog(tenantId, companyId)],
            async token =>
            {
                var currency = await writeStore.GetForUpdateAsync(request.Id, token);
                if (currency is null || currency.IsDeleted)
                    return Result.Failure<CurrencyResponse>(errors.NotFound);

                var code = request.CurrencyCode.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, request.Id, token))
                    return Result.Failure<CurrencyResponse>(errors.DuplicateCode);

                writeStore.ApplyOriginalRowVersion(currency, Convert.FromBase64String(request.RowVersion));
                currency.UpdateIdentity(code, request.NameEn, request.NameAr, request.Symbol);
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(currency.Id, token)
                    ?? throw new InvalidOperationException("The updated currency could not be read.");
                return Result.Success(response);
            },
            cancellationToken);
    }
}

public sealed class ArchiveCurrencyCommandHandler(
    ICurrencyWriteStore writeStore,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    CurrencyErrors errors)
    : ICommandHandler<ArchiveCurrencyCommand, Result>
{
    public async Task<Result> Handle(ArchiveCurrencyCommand request, CancellationToken cancellationToken)
    {
        if (!CurrencyCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.CompanyContextRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [CurrencyLocks.CompanyCatalog(tenantId, companyId)],
            async token =>
            {
                var currency = await writeStore.GetForUpdateAsync(request.Id, token);
                if (currency is null) return Result.Failure(errors.NotFound);
                if (currency.IsDeleted) return Result.Success();
                if (await writeStore.IsReferencedAsync(currency.Id, token))
                    return Result.Failure(errors.InUse);

                writeStore.ApplyOriginalRowVersion(currency, Convert.FromBase64String(request.RowVersion));
                currency.IsDeleted = true;
                currency.DeletedById = actor.UserId;
                currency.DeletedByPc = actor.MachineName;
                currency.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreCurrencyCommandHandler(
    ICurrencyWriteStore writeStore,
    ICurrencyReadStore readStore,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    CurrencyErrors errors)
    : ICommandHandler<RestoreCurrencyCommand, Result<CurrencyResponse>>
{
    public async Task<Result<CurrencyResponse>> Handle(RestoreCurrencyCommand request, CancellationToken cancellationToken)
    {
        if (!CurrencyCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<CurrencyResponse>(errors.CompanyContextRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [CurrencyLocks.CompanyCatalog(tenantId, companyId)],
            async token =>
            {
                var currency = await writeStore.GetForUpdateAsync(request.Id, token);
                if (currency is null) return Result.Failure<CurrencyResponse>(errors.NotFound);
                if (!currency.IsDeleted)
                {
                    var current = await readStore.GetByIdAsync(currency.Id, token)
                        ?? throw new InvalidOperationException("The currency could not be read.");
                    return Result.Success(current);
                }

                writeStore.ApplyOriginalRowVersion(currency, Convert.FromBase64String(request.RowVersion));
                currency.IsDeleted = false;
                currency.DeletedById = null;
                currency.DeletedByPc = null;
                currency.DeletedOn = null;
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(currency.Id, token)
                    ?? throw new InvalidOperationException("The restored currency could not be read.");
                return Result.Success(response);
            },
            cancellationToken);
    }
}

internal static class CurrencyCommandSupport
{
    public static bool TryGetScope(ICurrentActor actor, out string tenantId, out int companyId)
    {
        tenantId = actor.TenantId?.Trim() ?? string.Empty;
        companyId = actor.CompanyId ?? 0;
        return tenantId.Length > 0 && companyId > 0;
    }

    public static bool IsValidRowVersion(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        try
        {
            return Convert.FromBase64String(value).Length > 0;
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
