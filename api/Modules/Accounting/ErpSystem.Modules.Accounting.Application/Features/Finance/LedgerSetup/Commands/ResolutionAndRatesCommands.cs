using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;

public sealed record CreateExchangeRateTypeCommand(ExchangeRateTypeRequest Data) : ICommand<Result<ExchangeRateTypeResponse>>;
public sealed record UpdateExchangeRateTypeCommand(int Id, ExchangeRateTypeRequest Data) : ICommand<Result<ExchangeRateTypeResponse>>;
public sealed record CreateExchangeRateCommand(ExchangeRateRequest Data) : ICommand<Result<ExchangeRateResponse>>;
public sealed record UpdateExchangeRateCommand(int Id, ExchangeRateRequest Data) : ICommand<Result<ExchangeRateResponse>>;
public sealed class ExchangeRateTypeRequestValidator : AbstractValidator<ExchangeRateTypeRequest> { public ExchangeRateTypeRequestValidator() { RuleFor(item => item.Code).NotEmpty().MaximumLength(30); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateExchangeRateTypeCommandValidator : AbstractValidator<CreateExchangeRateTypeCommand> { public CreateExchangeRateTypeCommandValidator() => RuleFor(item => item.Data).SetValidator(new ExchangeRateTypeRequestValidator()); }
public sealed class UpdateExchangeRateTypeCommandValidator : AbstractValidator<UpdateExchangeRateTypeCommand> { public UpdateExchangeRateTypeCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new ExchangeRateTypeRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class ExchangeRateRequestValidator : AbstractValidator<ExchangeRateRequest> { public ExchangeRateRequestValidator() { RuleFor(item => item.ExchangeRateTypeId).GreaterThan(0); RuleFor(item => item.FromCurrencyId).GreaterThan(0); RuleFor(item => item.ToCurrencyId).GreaterThan(0); RuleFor(item => item).Must(item => item.FromCurrencyId != item.ToCurrencyId); RuleFor(item => item.EffectiveTo).Must((item, end) => !end.HasValue || end.Value >= item.EffectiveFrom); RuleFor(item => item.Version).GreaterThan(0); RuleFor(item => item.Rate).GreaterThan(0); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateExchangeRateCommandValidator : AbstractValidator<CreateExchangeRateCommand> { public CreateExchangeRateCommandValidator() => RuleFor(item => item.Data).SetValidator(new ExchangeRateRequestValidator()); }
public sealed class UpdateExchangeRateCommandValidator : AbstractValidator<UpdateExchangeRateCommand> { public UpdateExchangeRateCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new ExchangeRateRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }

public sealed class CreateExchangeRateTypeCommandHandler(IExchangeRateTypeStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateExchangeRateTypeCommand, Result<ExchangeRateTypeResponse>>
{
    public async Task<Result<ExchangeRateTypeResponse>> Handle(CreateExchangeRateTypeCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<ExchangeRateTypeResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("ExchangeRates", tenantId, companyId)],
            async token =>
            {
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(code, null, token))
                    return Result.Failure<ExchangeRateTypeResponse>(errors.Duplicate("ExchangeRateType"));
                var entity = new ExchangeRateType(code, data.NameAr, data.NameEn);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.ExchangeRateType(entity));
            }, cancellationToken);
    }
}
public sealed class UpdateExchangeRateTypeCommandHandler(IExchangeRateTypeStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateExchangeRateTypeCommand, Result<ExchangeRateTypeResponse>>
{
    public async Task<Result<ExchangeRateTypeResponse>> Handle(UpdateExchangeRateTypeCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<ExchangeRateTypeResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("ExchangeRates", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<ExchangeRateTypeResponse>(errors.NotFound("ExchangeRateType"));
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(code, request.Id, token))
                    return Result.Failure<ExchangeRateTypeResponse>(errors.Duplicate("ExchangeRateType"));
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.Update(code, data.NameAr, data.NameEn);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.ExchangeRateType(entity));
            }, cancellationToken);
    }
}

public sealed class CreateExchangeRateCommandHandler(IExchangeRateStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateExchangeRateCommand, Result<ExchangeRateResponse>>
{
    public async Task<Result<ExchangeRateResponse>> Handle(CreateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<ExchangeRateResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.ExchangeRateResources(tenantId, companyId),
            async token =>
            {
                var data = request.Data;
                if (!await store.RateTypeExistsAsync(data.ExchangeRateTypeId, token))
                    return Result.Failure<ExchangeRateResponse>(errors.InvalidReference("ExchangeRateType"));
                if (data.FromCurrencyId == data.ToCurrencyId
                    || !await store.CurrencyExistsAsync(data.FromCurrencyId, token)
                    || !await store.CurrencyExistsAsync(data.ToCurrencyId, token))
                    return Result.Failure<ExchangeRateResponse>(errors.InvalidReference("Currency"));
                if (await store.DuplicateSeriesAsync(data, null, token))
                    return Result.Failure<ExchangeRateResponse>(errors.Duplicate("ExchangeRate"));

                var entity = new ExchangeRate(data.ExchangeRateTypeId, data.FromCurrencyId, data.ToCurrencyId, data.EffectiveFrom, data.EffectiveTo, data.Version, data.Rate);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(ExchangeRateResponseFor(entity));
            }, cancellationToken);
    }

    private static ExchangeRateResponse ExchangeRateResponseFor(ExchangeRate entity) =>
        new(entity.Id, entity.ExchangeRateTypeId, entity.FromCurrencyId, entity.ToCurrencyId, entity.EffectiveFrom, entity.EffectiveTo, entity.Version, entity.Rate, Convert.ToBase64String(entity.RowVersion));
}
public sealed class UpdateExchangeRateCommandHandler(IExchangeRateStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateExchangeRateCommand, Result<ExchangeRateResponse>>
{
    public async Task<Result<ExchangeRateResponse>> Handle(UpdateExchangeRateCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<ExchangeRateResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.ExchangeRateResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<ExchangeRateResponse>(errors.NotFound("ExchangeRate"));
                var data = request.Data;
                if (!await store.RateTypeExistsAsync(data.ExchangeRateTypeId, token))
                    return Result.Failure<ExchangeRateResponse>(errors.InvalidReference("ExchangeRateType"));
                if (data.FromCurrencyId == data.ToCurrencyId
                    || !await store.CurrencyExistsAsync(data.FromCurrencyId, token)
                    || !await store.CurrencyExistsAsync(data.ToCurrencyId, token))
                    return Result.Failure<ExchangeRateResponse>(errors.InvalidReference("Currency"));
                if (await store.DuplicateSeriesAsync(data, request.Id, token))
                    return Result.Failure<ExchangeRateResponse>(errors.Duplicate("ExchangeRate"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.ChangeDefinition(data.ExchangeRateTypeId, data.FromCurrencyId, data.ToCurrencyId);
                entity.Update(data.EffectiveFrom, data.EffectiveTo, data.Version, data.Rate);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new ExchangeRateResponse(entity.Id, entity.ExchangeRateTypeId, entity.FromCurrencyId, entity.ToCurrencyId, entity.EffectiveFrom, entity.EffectiveTo, entity.Version, entity.Rate, Convert.ToBase64String(entity.RowVersion)));
            }, cancellationToken);
    }
}

public sealed record CreateAccountMappingCommand(AccountMappingRequest Data) : ICommand<Result<AccountMappingResponse>>;
public sealed record UpdateAccountMappingCommand(int Id, AccountMappingRequest Data) : ICommand<Result<AccountMappingResponse>>;
public sealed class AccountMappingRequestValidator : AbstractValidator<AccountMappingRequest> { public AccountMappingRequestValidator() { RuleFor(item => item.BookId).GreaterThan(0); RuleFor(item => item.PurposeCode).NotEmpty().MaximumLength(100); RuleFor(item => item.SourceType).IsInEnum(); RuleFor(item => item.AccountId).GreaterThan(0); RuleFor(item => item.EffectiveTo).Must((item, end) => !end.HasValue || end.Value >= item.EffectiveFrom); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateAccountMappingCommandValidator : AbstractValidator<CreateAccountMappingCommand> { public CreateAccountMappingCommandValidator() => RuleFor(item => item.Data).SetValidator(new AccountMappingRequestValidator()); }
public sealed class UpdateAccountMappingCommandValidator : AbstractValidator<UpdateAccountMappingCommand> { public UpdateAccountMappingCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new AccountMappingRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class CreateAccountMappingCommandHandler(IAccountMappingStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateAccountMappingCommand, Result<AccountMappingResponse>>
{
    public async Task<Result<AccountMappingResponse>> Handle(CreateAccountMappingCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<AccountMappingResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.AccountDeterminationResources(tenantId, companyId),
            async token =>
            {
                var data = request.Data;
                if (data.SourceType != Domain.Finance.LedgerSetup.Enums.AccountMappingSourceType.Company || !string.IsNullOrWhiteSpace(data.SourceReferenceId))
                    return Result.Failure<AccountMappingResponse>(errors.InvalidMapping);
                if (!await store.BookExistsAsync(data.BookId, token) || !await store.AccountExistsAsync(data.AccountId, token))
                    return Result.Failure<AccountMappingResponse>(errors.InvalidReference("BookOrAccount"));
                if (await store.DuplicateAsync(data, null, token))
                    return Result.Failure<AccountMappingResponse>(errors.Duplicate("AccountMapping"));
                var entity = new AccountMapping(data.BookId, data.PurposeCode, data.SourceType, data.SourceReferenceId, data.AccountId, data.EffectiveFrom, data.EffectiveTo);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(AccountMappingResponseFor(entity));
            }, cancellationToken);
    }

    private static AccountMappingResponse AccountMappingResponseFor(AccountMapping entity) =>
        new(entity.Id, entity.BookId, entity.PurposeCode, entity.SourceType, entity.SourceReferenceId, entity.AccountId, entity.EffectiveFrom, entity.EffectiveTo, Convert.ToBase64String(entity.RowVersion));
}
public sealed class UpdateAccountMappingCommandHandler(IAccountMappingStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateAccountMappingCommand, Result<AccountMappingResponse>>
{
    public async Task<Result<AccountMappingResponse>> Handle(UpdateAccountMappingCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<AccountMappingResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.AccountDeterminationResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<AccountMappingResponse>(errors.NotFound("AccountMapping"));
                var data = request.Data;
                if (data.SourceType != Domain.Finance.LedgerSetup.Enums.AccountMappingSourceType.Company || !string.IsNullOrWhiteSpace(data.SourceReferenceId))
                    return Result.Failure<AccountMappingResponse>(errors.InvalidMapping);
                if (!await store.BookExistsAsync(data.BookId, token) || !await store.AccountExistsAsync(data.AccountId, token))
                    return Result.Failure<AccountMappingResponse>(errors.InvalidReference("BookOrAccount"));
                if (await store.DuplicateAsync(data, request.Id, token))
                    return Result.Failure<AccountMappingResponse>(errors.Duplicate("AccountMapping"));
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.ChangeDefinition(data.BookId, data.PurposeCode, data.SourceType, data.SourceReferenceId);
                entity.ChangeTarget(data.AccountId);
                entity.ChangeEffectiveRange(data.EffectiveFrom, data.EffectiveTo);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new AccountMappingResponse(entity.Id, entity.BookId, entity.PurposeCode, entity.SourceType, entity.SourceReferenceId, entity.AccountId, entity.EffectiveFrom, entity.EffectiveTo, Convert.ToBase64String(entity.RowVersion)));
            }, cancellationToken);
    }
}

public sealed record CreatePostingProfileCommand(PostingProfileRequest Data) : ICommand<Result<PostingProfileResponse>>;
public sealed record UpdatePostingProfileCommand(int Id, PostingProfileRequest Data) : ICommand<Result<PostingProfileResponse>>;
public sealed class PostingProfileRequestValidator : AbstractValidator<PostingProfileRequest> { public PostingProfileRequestValidator() { RuleFor(item => item.BookId).GreaterThan(0); RuleFor(item => item.Code).NotEmpty().MaximumLength(50); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.PurposeCode).NotEmpty().MaximumLength(100); RuleFor(item => item.ContextType).IsInEnum(); RuleFor(item => item.AccountId).GreaterThan(0); RuleFor(item => item.Priority).GreaterThanOrEqualTo(0); RuleFor(item => item.Version).GreaterThan(0); RuleFor(item => item.EffectiveTo).Must((item, end) => !end.HasValue || end.Value >= item.EffectiveFrom); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreatePostingProfileCommandValidator : AbstractValidator<CreatePostingProfileCommand> { public CreatePostingProfileCommandValidator() => RuleFor(item => item.Data).SetValidator(new PostingProfileRequestValidator()); }
public sealed class UpdatePostingProfileCommandValidator : AbstractValidator<UpdatePostingProfileCommand> { public UpdatePostingProfileCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new PostingProfileRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class CreatePostingProfileCommandHandler(IPostingProfileStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreatePostingProfileCommand, Result<PostingProfileResponse>>
{
    public async Task<Result<PostingProfileResponse>> Handle(CreatePostingProfileCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<PostingProfileResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.AccountDeterminationResources(tenantId, companyId),
            async token =>
            {
                var data = request.Data;
                if (data.ContextType != Domain.Finance.LedgerSetup.Enums.PostingProfileContextType.Company || !string.IsNullOrWhiteSpace(data.ContextReferenceId))
                    return Result.Failure<PostingProfileResponse>(errors.InvalidMapping);
                if (!await store.BookExistsAsync(data.BookId, token) || !await store.AccountExistsAsync(data.AccountId, token))
                    return Result.Failure<PostingProfileResponse>(errors.InvalidReference("BookOrAccount"));
                if (await store.DuplicateAsync(data, null, token))
                    return Result.Failure<PostingProfileResponse>(errors.Duplicate("PostingProfile"));
                var entity = new PostingProfile(data.BookId, data.Code, data.NameAr, data.NameEn, data.PurposeCode, data.ContextType, data.ContextReferenceId, data.AccountId, data.Priority, data.Version, data.EffectiveFrom, data.EffectiveTo);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(PostingProfileResponseFor(entity));
            }, cancellationToken);
    }

    private static PostingProfileResponse PostingProfileResponseFor(PostingProfile entity) =>
        new(entity.Id, entity.BookId, entity.Code, entity.NameAr, entity.NameEn, entity.PurposeCode, entity.ContextType, entity.ContextReferenceId, entity.AccountId, entity.Priority, entity.Version, entity.EffectiveFrom, entity.EffectiveTo, Convert.ToBase64String(entity.RowVersion));
}
public sealed class UpdatePostingProfileCommandHandler(IPostingProfileStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdatePostingProfileCommand, Result<PostingProfileResponse>>
{
    public async Task<Result<PostingProfileResponse>> Handle(UpdatePostingProfileCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<PostingProfileResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.AccountDeterminationResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<PostingProfileResponse>(errors.NotFound("PostingProfile"));
                var data = request.Data;
                if (data.ContextType != Domain.Finance.LedgerSetup.Enums.PostingProfileContextType.Company || !string.IsNullOrWhiteSpace(data.ContextReferenceId))
                    return Result.Failure<PostingProfileResponse>(errors.InvalidMapping);
                if (!await store.BookExistsAsync(data.BookId, token) || !await store.AccountExistsAsync(data.AccountId, token))
                    return Result.Failure<PostingProfileResponse>(errors.InvalidReference("BookOrAccount"));
                if (await store.DuplicateAsync(data, request.Id, token))
                    return Result.Failure<PostingProfileResponse>(errors.Duplicate("PostingProfile"));
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.UpdateIdentity(data.Code, data.NameAr, data.NameEn, data.PurposeCode);
                entity.ChangeDefinition(data.BookId, data.ContextType, data.ContextReferenceId);
                entity.ChangeTarget(data.AccountId);
                entity.ChangeResolutionPolicy(data.Priority, data.Version, data.EffectiveFrom, data.EffectiveTo);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new PostingProfileResponse(entity.Id, entity.BookId, entity.Code, entity.NameAr, entity.NameEn, entity.PurposeCode, entity.ContextType, entity.ContextReferenceId, entity.AccountId, entity.Priority, entity.Version, entity.EffectiveFrom, entity.EffectiveTo, Convert.ToBase64String(entity.RowVersion)));
            }, cancellationToken);
    }
}
