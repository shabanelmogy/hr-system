using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;

public sealed record CreateDimensionDefinitionCommand(DimensionDefinitionRequest Data) : ICommand<Result<DimensionDefinitionResponse>>;
public sealed record UpdateDimensionDefinitionCommand(int Id, DimensionDefinitionRequest Data) : ICommand<Result<DimensionDefinitionResponse>>;
public sealed record CreateDimensionValueCommand(DimensionValueRequest Data) : ICommand<Result<DimensionValueResponse>>;
public sealed record UpdateDimensionValueCommand(int Id, DimensionValueRequest Data) : ICommand<Result<DimensionValueResponse>>;
public sealed record UpsertAccountDimensionPolicyCommand(AccountDimensionPolicyRequest Data) : ICommand<Result<AccountDimensionPolicyResponse>>;

public sealed class DimensionDefinitionRequestValidator : AbstractValidator<DimensionDefinitionRequest> { public DimensionDefinitionRequestValidator() { RuleFor(item => item.Code).NotEmpty().MaximumLength(50); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.ValueSource).IsInEnum(); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateDimensionDefinitionCommandValidator : AbstractValidator<CreateDimensionDefinitionCommand> { public CreateDimensionDefinitionCommandValidator() => RuleFor(item => item.Data).SetValidator(new DimensionDefinitionRequestValidator()); }
public sealed class UpdateDimensionDefinitionCommandValidator : AbstractValidator<UpdateDimensionDefinitionCommand> { public UpdateDimensionDefinitionCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new DimensionDefinitionRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class DimensionValueRequestValidator : AbstractValidator<DimensionValueRequest> { public DimensionValueRequestValidator() { RuleFor(item => item.DimensionDefinitionId).GreaterThan(0); RuleFor(item => item.Code).NotEmpty().MaximumLength(80); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateDimensionValueCommandValidator : AbstractValidator<CreateDimensionValueCommand> { public CreateDimensionValueCommandValidator() => RuleFor(item => item.Data).SetValidator(new DimensionValueRequestValidator()); }
public sealed class UpdateDimensionValueCommandValidator : AbstractValidator<UpdateDimensionValueCommand> { public UpdateDimensionValueCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new DimensionValueRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }

public sealed class CreateDimensionDefinitionCommandHandler(IDimensionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateDimensionDefinitionCommand, Result<DimensionDefinitionResponse>>
{
    public async Task<Result<DimensionDefinitionResponse>> Handle(CreateDimensionDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.DefinitionCodeExistsAsync(code, null, token))
                    return Result.Failure<DimensionDefinitionResponse>(errors.Duplicate("DimensionDefinition"));

                var entity = new DimensionDefinition(code, data.NameAr, data.NameEn, data.ValueSource);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.DimensionDefinition(entity));
            },
            cancellationToken);
    }
}
public sealed class UpdateDimensionDefinitionCommandHandler(IDimensionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateDimensionDefinitionCommand, Result<DimensionDefinitionResponse>>
{
    public async Task<Result<DimensionDefinitionResponse>> Handle(UpdateDimensionDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetDefinitionForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<DimensionDefinitionResponse>(errors.NotFound("DimensionDefinition"));
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.DefinitionCodeExistsAsync(code, request.Id, token))
                    return Result.Failure<DimensionDefinitionResponse>(errors.Duplicate("DimensionDefinition"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.Update(code, data.NameAr, data.NameEn, data.ValueSource);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.DimensionDefinition(entity));
            },
            cancellationToken);
    }
}
public sealed class CreateDimensionValueCommandHandler(IDimensionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateDimensionValueCommand, Result<DimensionValueResponse>>
{
    public async Task<Result<DimensionValueResponse>> Handle(CreateDimensionValueCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionValueResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var data = request.Data;
                if (!await store.DefinitionExistsAsync(data.DimensionDefinitionId, token))
                    return Result.Failure<DimensionValueResponse>(errors.InvalidReference("DimensionDefinition"));
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.ValueCodeExistsAsync(data.DimensionDefinitionId, code, null, token))
                    return Result.Failure<DimensionValueResponse>(errors.Duplicate("DimensionValue"));

                var entity = new DimensionValue(data.DimensionDefinitionId, code, data.NameAr, data.NameEn);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.DimensionValue(entity));
            },
            cancellationToken);
    }
}
public sealed class UpdateDimensionValueCommandHandler(IDimensionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateDimensionValueCommand, Result<DimensionValueResponse>>
{
    public async Task<Result<DimensionValueResponse>> Handle(UpdateDimensionValueCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionValueResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetValueForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<DimensionValueResponse>(errors.NotFound("DimensionValue"));
                var data = request.Data;
                if (entity.DimensionDefinitionId != data.DimensionDefinitionId || !await store.DefinitionExistsAsync(data.DimensionDefinitionId, token))
                    return Result.Failure<DimensionValueResponse>(errors.InvalidReference("DimensionDefinition"));
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.ValueCodeExistsAsync(data.DimensionDefinitionId, code, request.Id, token))
                    return Result.Failure<DimensionValueResponse>(errors.Duplicate("DimensionValue"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.Update(code, data.NameAr, data.NameEn);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.DimensionValue(entity));
            },
            cancellationToken);
    }
}
public sealed class UpsertAccountDimensionPolicyCommandValidator : AbstractValidator<UpsertAccountDimensionPolicyCommand> { public UpsertAccountDimensionPolicyCommandValidator() { RuleFor(item => item.Data.AccountId).GreaterThan(0); RuleFor(item => item.Data.DimensionDefinitionId).GreaterThan(0); RuleFor(item => item.Data.Requirement).IsInEnum(); RuleFor(item => item.Data.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class UpsertAccountDimensionPolicyCommandHandler(IDimensionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpsertAccountDimensionPolicyCommand, Result<AccountDimensionPolicyResponse>>
{
    public async Task<Result<AccountDimensionPolicyResponse>> Handle(UpsertAccountDimensionPolicyCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<AccountDimensionPolicyResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)
            ],
            async token =>
            {
                var data = request.Data;
                if (!await store.AccountExistsAsync(data.AccountId, token))
                    return Result.Failure<AccountDimensionPolicyResponse>(errors.InvalidReference("Account"));
                if (!await store.DefinitionExistsAsync(data.DimensionDefinitionId, token))
                    return Result.Failure<AccountDimensionPolicyResponse>(errors.InvalidReference("DimensionDefinition"));

                var current = await store.GetPolicyForUpdateAsync(data.AccountId, data.DimensionDefinitionId, token);
                if (current is null)
                {
                    var entity = new AccountDimensionPolicy(data.AccountId, data.DimensionDefinitionId, data.Requirement);
                    store.Add(entity);
                    await unitOfWork.SaveChangesAsync(token);
                    return Result.Success(new AccountDimensionPolicyResponse(entity.Id, entity.AccountId, entity.DimensionDefinitionId, entity.Requirement, Convert.ToBase64String(entity.RowVersion)));
                }
                if (data.RowVersion is null)
                    return Result.Failure<AccountDimensionPolicyResponse>(errors.Concurrency);

                store.ApplyOriginalRowVersion(current, LedgerSetupCommandSupport.Version(data.RowVersion));
                current.ChangeRequirement(data.Requirement);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new AccountDimensionPolicyResponse(current.Id, current.AccountId, current.DimensionDefinitionId, current.Requirement, Convert.ToBase64String(current.RowVersion)));
            },
            cancellationToken);
    }
}

public sealed record CreateBookCommand(BookRequest Data) : ICommand<Result<BookResponse>>;
public sealed record UpdateBookCommand(int Id, BookRequest Data) : ICommand<Result<BookResponse>>;
public sealed class BookRequestValidator : AbstractValidator<BookRequest> { public BookRequestValidator() { RuleFor(item => item.Code).NotEmpty().MaximumLength(30); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateBookCommandValidator : AbstractValidator<CreateBookCommand> { public CreateBookCommandValidator() => RuleFor(item => item.Data).SetValidator(new BookRequestValidator()); }
public sealed class UpdateBookCommandValidator : AbstractValidator<UpdateBookCommand> { public UpdateBookCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new BookRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class CreateBookCommandHandler(IBookWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateBookCommand, Result<BookResponse>>
{
    public async Task<Result<BookResponse>> Handle(CreateBookCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<BookResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.BookResources(tenantId, companyId),
            async token =>
            {
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(code, null, token))
                    return Result.Failure<BookResponse>(errors.Duplicate("Book"));
                if (await store.HasPrimaryAsync(token))
                    return Result.Failure<BookResponse>(errors.Duplicate("PrimaryBook"));

                var entity = new Book(code, data.NameAr, data.NameEn) { TenantId = tenantId, CompanyId = companyId };
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.Book(entity));
            },
            cancellationToken);
    }
}
public sealed class UpdateBookCommandHandler(IBookWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateBookCommand, Result<BookResponse>>
{
    public async Task<Result<BookResponse>> Handle(UpdateBookCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<BookResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.BookResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<BookResponse>(errors.NotFound("Book"));
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(code, request.Id, token))
                    return Result.Failure<BookResponse>(errors.Duplicate("Book"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.Update(code, data.NameAr, data.NameEn);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.Book(entity));
            },
            cancellationToken);
    }
}

public sealed record CreateJournalDefinitionCommand(JournalDefinitionRequest Data) : ICommand<Result<JournalDefinitionResponse>>;
public sealed record UpdateJournalDefinitionCommand(int Id, JournalDefinitionRequest Data) : ICommand<Result<JournalDefinitionResponse>>;
public sealed class JournalDefinitionRequestValidator : AbstractValidator<JournalDefinitionRequest> { public JournalDefinitionRequestValidator() { RuleFor(item => item.BookId).GreaterThan(0); RuleFor(item => item.Code).NotEmpty().MaximumLength(30); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.CategoryCode).NotEmpty().MaximumLength(50); RuleFor(item => item.NumberPrefix).NotEmpty().MaximumLength(20); RuleFor(item => item.NumberPadding).InclusiveBetween(1, 12); RuleFor(item => item.NextNumber).GreaterThan(0); RuleFor(item => item.ResetPolicy).IsInEnum(); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateJournalDefinitionCommandValidator : AbstractValidator<CreateJournalDefinitionCommand> { public CreateJournalDefinitionCommandValidator() => RuleFor(item => item.Data).SetValidator(new JournalDefinitionRequestValidator()); }
public sealed class UpdateJournalDefinitionCommandValidator : AbstractValidator<UpdateJournalDefinitionCommand> { public UpdateJournalDefinitionCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new JournalDefinitionRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class CreateJournalDefinitionCommandHandler(IJournalDefinitionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateJournalDefinitionCommand, Result<JournalDefinitionResponse>>
{
    public async Task<Result<JournalDefinitionResponse>> Handle(CreateJournalDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<JournalDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.JournalResources(tenantId, companyId),
            async token =>
            {
                var data = request.Data;
                if (!await store.BookExistsAsync(data.BookId, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.InvalidReference("Book"));
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(data.BookId, code, null, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.Duplicate("JournalDefinition"));

                var entity = new JournalDefinition(data.BookId, code, data.NameAr, data.NameEn, data.CategoryCode, data.NumberPrefix, data.NumberPadding, data.ResetPolicy, data.NextNumber) { TenantId = tenantId, CompanyId = companyId };
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.Journal(entity));
            },
            cancellationToken);
    }
}
public sealed class UpdateJournalDefinitionCommandHandler(IJournalDefinitionWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateJournalDefinitionCommand, Result<JournalDefinitionResponse>>
{
    public async Task<Result<JournalDefinitionResponse>> Handle(UpdateJournalDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<JournalDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.JournalResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted)
                    return Result.Failure<JournalDefinitionResponse>(errors.NotFound("JournalDefinition"));
                var data = request.Data;
                if (!await store.BookExistsAsync(data.BookId, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.InvalidReference("Book"));
                var code = data.Code.Trim().ToUpperInvariant();
                if (await store.CodeExistsAsync(data.BookId, code, request.Id, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.Duplicate("JournalDefinition"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.ChangeBook(data.BookId);
                entity.Update(code, data.NameAr, data.NameEn, data.CategoryCode, data.NumberPrefix, data.NumberPadding, data.ResetPolicy, data.NextNumber);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupLifecycle.Journal(entity));
            },
            cancellationToken);
    }
}
