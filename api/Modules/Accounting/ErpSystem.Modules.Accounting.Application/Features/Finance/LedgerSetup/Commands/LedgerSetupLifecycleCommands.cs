using ErpSystem.BuildingBlocks.Domain.Entities;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;

public interface ILedgerSetupLifecycleCommand
{
    int Id { get; }
    string RowVersion { get; }
}

public sealed record ArchiveAccountHierarchyLevelCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreAccountHierarchyLevelCommand(int Id, string RowVersion) : ICommand<Result<AccountHierarchyLevelResponse>>, ILedgerSetupLifecycleCommand;
public sealed record ArchiveDimensionDefinitionCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreDimensionDefinitionCommand(int Id, string RowVersion) : ICommand<Result<DimensionDefinitionResponse>>, ILedgerSetupLifecycleCommand;
public sealed record ArchiveDimensionValueCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreDimensionValueCommand(int Id, string RowVersion) : ICommand<Result<DimensionValueResponse>>, ILedgerSetupLifecycleCommand;
public sealed record ArchiveBookCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreBookCommand(int Id, string RowVersion) : ICommand<Result<BookResponse>>, ILedgerSetupLifecycleCommand;
public sealed record ArchiveJournalDefinitionCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreJournalDefinitionCommand(int Id, string RowVersion) : ICommand<Result<JournalDefinitionResponse>>, ILedgerSetupLifecycleCommand;
public sealed record ArchiveExchangeRateTypeCommand(int Id, string RowVersion) : ICommand<Result>, ILedgerSetupLifecycleCommand;
public sealed record RestoreExchangeRateTypeCommand(int Id, string RowVersion) : ICommand<Result<ExchangeRateTypeResponse>>, ILedgerSetupLifecycleCommand;

public abstract class LedgerSetupLifecycleCommandValidator<T> : AbstractValidator<T>
    where T : ILedgerSetupLifecycleCommand
{
    protected LedgerSetupLifecycleCommandValidator()
    {
        RuleFor(item => item.Id).GreaterThan(0);
        RuleFor(item => item.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion);
    }
}

public sealed class ArchiveAccountHierarchyLevelCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveAccountHierarchyLevelCommand>;
public sealed class RestoreAccountHierarchyLevelCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreAccountHierarchyLevelCommand>;
public sealed class ArchiveDimensionDefinitionCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveDimensionDefinitionCommand>;
public sealed class RestoreDimensionDefinitionCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreDimensionDefinitionCommand>;
public sealed class ArchiveDimensionValueCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveDimensionValueCommand>;
public sealed class RestoreDimensionValueCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreDimensionValueCommand>;
public sealed class ArchiveBookCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveBookCommand>;
public sealed class RestoreBookCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreBookCommand>;
public sealed class ArchiveJournalDefinitionCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveJournalDefinitionCommand>;
public sealed class RestoreJournalDefinitionCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreJournalDefinitionCommand>;
public sealed class ArchiveExchangeRateTypeCommandValidator : LedgerSetupLifecycleCommandValidator<ArchiveExchangeRateTypeCommand>;
public sealed class RestoreExchangeRateTypeCommandValidator : LedgerSetupLifecycleCommandValidator<RestoreExchangeRateTypeCommand>;

public sealed class ArchiveAccountHierarchyLevelCommandHandler(
    IAccountHierarchyLevelStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveAccountHierarchyLevelCommand, Result>
{
    public async Task<Result> Handle(ArchiveAccountHierarchyLevelCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("AccountHierarchyLevels", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId)
            ],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("AccountHierarchyLevel"));
                if (entity.IsDeleted)
                    return Result.Success();
                if (await store.IsReferencedAsync(entity.Id, token))
                    return Result.Failure(errors.InUse("AccountHierarchyLevel"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            }, cancellationToken);
    }
}

public sealed class RestoreAccountHierarchyLevelCommandHandler(
    IAccountHierarchyLevelStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreAccountHierarchyLevelCommand, Result<AccountHierarchyLevelResponse>>
{
    public async Task<Result<AccountHierarchyLevelResponse>> Handle(RestoreAccountHierarchyLevelCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<AccountHierarchyLevelResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("AccountHierarchyLevels", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId)
            ],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<AccountHierarchyLevelResponse>(errors.NotFound("AccountHierarchyLevel"));
                if (entity.IsDeleted && await store.LevelNumberExistsAsync(entity.LevelNumber, entity.Id, token))
                    return Result.Failure<AccountHierarchyLevelResponse>(errors.Duplicate("AccountHierarchyLevel"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.AccountHierarchyLevel(entity));
            }, cancellationToken);
    }
}

public sealed class ArchiveDimensionDefinitionCommandHandler(
    IDimensionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveDimensionDefinitionCommand, Result>
{
    public async Task<Result> Handle(ArchiveDimensionDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetDefinitionForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("DimensionDefinition"));
                if (entity.IsDeleted)
                    return Result.Success();
                if (await store.DefinitionIsReferencedAsync(entity.Id, token))
                    return Result.Failure(errors.InUse("DimensionDefinition"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreDimensionDefinitionCommandHandler(
    IDimensionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreDimensionDefinitionCommand, Result<DimensionDefinitionResponse>>
{
    public async Task<Result<DimensionDefinitionResponse>> Handle(RestoreDimensionDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetDefinitionForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<DimensionDefinitionResponse>(errors.NotFound("DimensionDefinition"));
                if (entity.IsDeleted && await store.DefinitionCodeExistsAsync(entity.Code, entity.Id, token))
                    return Result.Failure<DimensionDefinitionResponse>(errors.Duplicate("DimensionDefinition"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.DimensionDefinition(entity));
            },
            cancellationToken);
    }
}

public sealed class ArchiveDimensionValueCommandHandler(
    IDimensionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveDimensionValueCommand, Result>
{
    public async Task<Result> Handle(ArchiveDimensionValueCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetValueForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("DimensionValue"));
                if (entity.IsDeleted)
                    return Result.Success();

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreDimensionValueCommandHandler(
    IDimensionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreDimensionValueCommand, Result<DimensionValueResponse>>
{
    public async Task<Result<DimensionValueResponse>> Handle(RestoreDimensionValueCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<DimensionValueResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Dimensions", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetValueForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<DimensionValueResponse>(errors.NotFound("DimensionValue"));
                if (entity.IsDeleted && !await store.DefinitionExistsAsync(entity.DimensionDefinitionId, token))
                    return Result.Failure<DimensionValueResponse>(errors.InvalidReference("DimensionDefinition"));
                if (entity.IsDeleted && await store.ValueCodeExistsAsync(entity.DimensionDefinitionId, entity.Code, entity.Id, token))
                    return Result.Failure<DimensionValueResponse>(errors.Duplicate("DimensionValue"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.DimensionValue(entity));
            },
            cancellationToken);
    }
}

public sealed class ArchiveBookCommandHandler(
    IBookWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveBookCommand, Result>
{
    public async Task<Result> Handle(ArchiveBookCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.BookResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("Book"));
                if (entity.IsDeleted)
                    return Result.Success();
                if (await store.IsReferencedAsync(entity.Id, token))
                    return Result.Failure(errors.InUse("Book"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreBookCommandHandler(
    IBookWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreBookCommand, Result<BookResponse>>
{
    public async Task<Result<BookResponse>> Handle(RestoreBookCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<BookResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.BookResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<BookResponse>(errors.NotFound("Book"));
                if (entity.IsDeleted && await store.CodeExistsAsync(entity.Code, entity.Id, token))
                    return Result.Failure<BookResponse>(errors.Duplicate("Book"));
                if (entity.IsDeleted && await store.HasPrimaryAsync(token))
                    return Result.Failure<BookResponse>(errors.Duplicate("PrimaryBook"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.Book(entity));
            },
            cancellationToken);
    }
}

public sealed class ArchiveJournalDefinitionCommandHandler(
    IJournalDefinitionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveJournalDefinitionCommand, Result>
{
    public async Task<Result> Handle(ArchiveJournalDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.JournalResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("JournalDefinition"));
                if (entity.IsDeleted)
                    return Result.Success();

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreJournalDefinitionCommandHandler(
    IJournalDefinitionWriteStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreJournalDefinitionCommand, Result<JournalDefinitionResponse>>
{
    public async Task<Result<JournalDefinitionResponse>> Handle(RestoreJournalDefinitionCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<JournalDefinitionResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            LedgerSetupLifecycle.JournalResources(tenantId, companyId),
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<JournalDefinitionResponse>(errors.NotFound("JournalDefinition"));
                if (entity.IsDeleted && !await store.BookExistsAsync(entity.BookId, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.InvalidReference("Book"));
                if (entity.IsDeleted && await store.CodeExistsAsync(entity.BookId, entity.Code, entity.Id, token))
                    return Result.Failure<JournalDefinitionResponse>(errors.Duplicate("JournalDefinition"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.Journal(entity));
            },
            cancellationToken);
    }
}

public sealed class ArchiveExchangeRateTypeCommandHandler(
    IExchangeRateTypeStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    TimeProvider timeProvider,
    LedgerSetupErrors errors) : ICommandHandler<ArchiveExchangeRateTypeCommand, Result>
{
    public async Task<Result> Handle(ArchiveExchangeRateTypeCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("ExchangeRates", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure(errors.NotFound("ExchangeRateType"));
                if (entity.IsDeleted)
                    return Result.Success();
                if (await store.IsReferencedAsync(entity.Id, token))
                    return Result.Failure(errors.InUse("ExchangeRateType"));

                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                LedgerSetupLifecycle.Archive(entity, actor.UserId, timeProvider);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}

public sealed class RestoreExchangeRateTypeCommandHandler(
    IExchangeRateTypeStore store,
    IAccountingUnitOfWork unitOfWork,
    ICurrentActor actor,
    LedgerSetupErrors errors) : ICommandHandler<RestoreExchangeRateTypeCommand, Result<ExchangeRateTypeResponse>>
{
    public async Task<Result<ExchangeRateTypeResponse>> Handle(RestoreExchangeRateTypeCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId))
            return Result.Failure<ExchangeRateTypeResponse>(errors.ScopeRequired);

        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("ExchangeRates", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null)
                    return Result.Failure<ExchangeRateTypeResponse>(errors.NotFound("ExchangeRateType"));
                if (entity.IsDeleted && await store.CodeExistsAsync(entity.Code, entity.Id, token))
                    return Result.Failure<ExchangeRateTypeResponse>(errors.Duplicate("ExchangeRateType"));

                if (entity.IsDeleted)
                {
                    store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                    LedgerSetupLifecycle.Restore(entity);
                    await unitOfWork.SaveChangesAsync(token);
                }

                return Result.Success(LedgerSetupLifecycle.ExchangeRateType(entity));
            },
            cancellationToken);
    }
}

internal static class LedgerSetupLifecycle
{
    public static IReadOnlyCollection<string> BookResources(string tenantId, int companyId) =>
    [
        LedgerSetupCommandSupport.CompanyResource("Books", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("Journals", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("AccountDetermination", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("Settings", tenantId, companyId)
    ];

    public static IReadOnlyCollection<string> JournalResources(string tenantId, int companyId) =>
    [
        LedgerSetupCommandSupport.CompanyResource("Books", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("Journals", tenantId, companyId)
    ];

    public static IReadOnlyCollection<string> ExchangeRateResources(string tenantId, int companyId) =>
    [
        LedgerSetupCommandSupport.CompanyResource("Currencies", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("ExchangeRates", tenantId, companyId)
    ];

    public static IReadOnlyCollection<string> AccountDeterminationResources(string tenantId, int companyId) =>
    [
        LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("Books", tenantId, companyId),
        LedgerSetupCommandSupport.CompanyResource("AccountDetermination", tenantId, companyId)
    ];

    public static void Archive(AuditableEntity entity, string? userId, TimeProvider timeProvider)
    {
        entity.IsDeleted = true;
        entity.DeletedById = userId;
        entity.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
    }

    public static void Restore(AuditableEntity entity)
    {
        entity.IsDeleted = false;
        entity.DeletedById = null;
        entity.DeletedOn = null;
        entity.DeletedByPc = null;
    }

    public static DimensionDefinitionResponse DimensionDefinition(DimensionDefinition entity) =>
        new(entity.Id, entity.Code, entity.NameAr, entity.NameEn, entity.ValueSource, entity.IsDeleted, Version(entity));

    public static AccountHierarchyLevelResponse AccountHierarchyLevel(AccountHierarchyLevel entity) =>
        new(entity.Id, entity.LevelNumber, entity.NameAr, entity.NameEn, entity.CanPost, entity.IsDeleted, Version(entity));

    public static DimensionValueResponse DimensionValue(DimensionValue entity) =>
        new(entity.Id, entity.DimensionDefinitionId, entity.Code, entity.NameAr, entity.NameEn, entity.IsDeleted, Version(entity));

    public static BookResponse Book(Book entity) =>
        new(entity.Id, entity.Code, entity.NameAr, entity.NameEn, entity.IsPrimary, entity.IsDeleted, Version(entity));

    public static JournalDefinitionResponse Journal(JournalDefinition entity) =>
        new(entity.Id, entity.BookId, entity.Code, entity.NameAr, entity.NameEn, entity.CategoryCode, entity.NumberPrefix, entity.NumberPadding, entity.ResetPolicy, entity.NextNumber, entity.IsDeleted, Version(entity));

    public static ExchangeRateTypeResponse ExchangeRateType(ExchangeRateType entity) =>
        new(entity.Id, entity.Code, entity.NameAr, entity.NameEn, entity.IsDeleted, Version(entity));

    private static string Version(AuditableEntity entity) => Convert.ToBase64String(entity.RowVersion);
}
