using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Contracts;
using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Commands;

public sealed class LedgerSetupErrors(ILedgerSetupLocalizer localizer)
{
    public Error ScopeRequired => new("Accounting.ScopeRequired", localizer.Text("ScopeRequired"), ErrorType.Forbidden);
    public Error NotFound(string name) => new($"Accounting.{name}.NotFound", localizer.Format("NotFound", EntityName(name)), ErrorType.NotFound);
    public Error Duplicate(string name) => new($"Accounting.{name}.Duplicate", localizer.Format("Duplicate", EntityName(name)), ErrorType.Conflict);
    public Error InvalidReference(string name) => new($"Accounting.{name}.InvalidReference", localizer.Format("InvalidReference", EntityName(name)), ErrorType.Validation);
    public Error InUse(string name) => new($"Accounting.{name}.InUse", localizer.Format("InUse", EntityName(name)), ErrorType.Conflict);
    public Error Concurrency => new("Accounting.ConcurrencyConflict", localizer.Text("ConcurrencyConflict"), ErrorType.Conflict);
    public Error InvalidHierarchy => new("Accounting.Account.InvalidHierarchy", localizer.Text("InvalidHierarchy"), ErrorType.Validation);
    public Error HierarchyLevelPostingInUse => new("Accounting.AccountHierarchyLevel.PostingInUse", localizer.Text("HierarchyLevelPostingInUse"), ErrorType.Conflict);
    public Error InvalidMapping => new("Accounting.AccountMapping.InvalidSource", localizer.Text("InvalidMapping"), ErrorType.Validation);
    public Error ResolutionMissing => new("Accounting.AccountResolution.Missing", localizer.Text("ResolutionMissing"), ErrorType.Validation);
    public Error ResolutionAmbiguous => new("Accounting.AccountResolution.Ambiguous", localizer.Text("ResolutionAmbiguous"), ErrorType.Conflict);

    private string EntityName(string name)
    {
        var key = $"Entity.{name}";
        var localized = localizer.Text(key);
        return string.Equals(localized, key, StringComparison.Ordinal) ? name : localized;
    }
}

internal static class LedgerSetupCommandSupport
{
    public static bool Scope(ICurrentActor actor, out string tenantId, out int companyId)
    {
        tenantId = actor.TenantId?.Trim() ?? string.Empty;
        companyId = actor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }
    public static byte[] Version(string value) => Convert.FromBase64String(value);
    public static bool ValidVersion(string? value) { if (string.IsNullOrWhiteSpace(value)) return false; try { return Convert.FromBase64String(value).Length > 0; } catch (FormatException) { return false; } }
    public static string CompanyResource(string name, string tenantId, int companyId) => $"Accounting:{name}:{tenantId}:{companyId}";
}

public sealed record SaveAccountingSettingsCommand(int FunctionalCurrencyId, int PrimaryBookId, string? RowVersion) : ICommand<Result<AccountingSettingsResponse>>;
public sealed class SaveAccountingSettingsCommandValidator : AbstractValidator<SaveAccountingSettingsCommand>
{ public SaveAccountingSettingsCommandValidator() { RuleFor(item => item.FunctionalCurrencyId).GreaterThan(0); RuleFor(item => item.PrimaryBookId).GreaterThan(0); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }

public sealed class SaveAccountingSettingsCommandHandler(IAccountingSettingsReadStore readStore, IAccountingSettingsWriteStore writeStore, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<SaveAccountingSettingsCommand, Result<AccountingSettingsResponse>>
{
    public async Task<Result<AccountingSettingsResponse>> Handle(SaveAccountingSettingsCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountingSettingsResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
        [
            LedgerSetupCommandSupport.CompanyResource("Settings", tenantId, companyId),
            LedgerSetupCommandSupport.CompanyResource("Currencies", tenantId, companyId),
            LedgerSetupCommandSupport.CompanyResource("Books", tenantId, companyId)
        ], async token =>
        {
            if (!await writeStore.CurrencyExistsAsync(request.FunctionalCurrencyId, token)) return Result.Failure<AccountingSettingsResponse>(errors.InvalidReference("Currency"));
            if (!await writeStore.PrimaryBookExistsAsync(request.PrimaryBookId, token)) return Result.Failure<AccountingSettingsResponse>(errors.InvalidReference("PrimaryBook"));
            var current = await writeStore.GetForUpdateAsync(token);
            if (current is null)
            {
                var created = new AccountingCompanySettings(request.FunctionalCurrencyId, request.PrimaryBookId) { TenantId = tenantId, CompanyId = companyId };
                writeStore.Add(created);
            }
            else
            {
                if (string.IsNullOrWhiteSpace(request.RowVersion)) return Result.Failure<AccountingSettingsResponse>(errors.Concurrency);
                writeStore.ApplyOriginalRowVersion(current, LedgerSetupCommandSupport.Version(request.RowVersion));
                current.Change(request.FunctionalCurrencyId, request.PrimaryBookId);
            }
            await unitOfWork.SaveChangesAsync(token);
            var result = await readStore.GetAsync(token);
            return result is null ? Result.Failure<AccountingSettingsResponse>(errors.NotFound("AccountingSettings")) : Result.Success(result);
        }, cancellationToken);
    }
}

public sealed record GetAccountingSettingsQuery : IQuery<Result<AccountingSettingsResponse>>;
public sealed class GetAccountingSettingsQueryHandler(IAccountingSettingsReadStore readStore, ICurrentActor actor, LedgerSetupErrors errors) : IQueryHandler<GetAccountingSettingsQuery, Result<AccountingSettingsResponse>>
{ public async Task<Result<AccountingSettingsResponse>> Handle(GetAccountingSettingsQuery request, CancellationToken cancellationToken) { if (!LedgerSetupCommandSupport.Scope(actor, out _, out _)) return Result.Failure<AccountingSettingsResponse>(errors.ScopeRequired); var value = await readStore.GetAsync(cancellationToken); return value is null ? Result.Failure<AccountingSettingsResponse>(errors.NotFound("AccountingSettings")) : Result.Success(value); } }

public sealed record CreateAccountHierarchyLevelCommand(int LevelNumber, string NameAr, string NameEn, bool CanPost) : ICommand<Result<AccountHierarchyLevelResponse>>;
public sealed record UpdateAccountHierarchyLevelCommand(int Id, int LevelNumber, string NameAr, string NameEn, bool CanPost, string RowVersion) : ICommand<Result<AccountHierarchyLevelResponse>>;
public sealed class AccountHierarchyLevelCommandValidator<T> : AbstractValidator<T> where T : class
{ public AccountHierarchyLevelCommandValidator() { RuleFor(item => item).NotNull(); } }
public sealed class CreateAccountHierarchyLevelCommandValidator : AbstractValidator<CreateAccountHierarchyLevelCommand> { public CreateAccountHierarchyLevelCommandValidator() { RuleFor(item => item.LevelNumber).GreaterThan(0); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); } }
public sealed class UpdateAccountHierarchyLevelCommandValidator : AbstractValidator<UpdateAccountHierarchyLevelCommand> { public UpdateAccountHierarchyLevelCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.LevelNumber).GreaterThan(0); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(150); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(150); RuleFor(item => item.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }

public sealed class CreateAccountHierarchyLevelCommandHandler(IAccountHierarchyLevelStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateAccountHierarchyLevelCommand, Result<AccountHierarchyLevelResponse>>
{
    public async Task<Result<AccountHierarchyLevelResponse>> Handle(CreateAccountHierarchyLevelCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountHierarchyLevelResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("AccountHierarchyLevels", tenantId, companyId)],
            async token =>
            {
                if (await store.LevelNumberExistsAsync(request.LevelNumber, null, token)) return Result.Failure<AccountHierarchyLevelResponse>(errors.Duplicate("AccountHierarchyLevel"));
                var entity = new AccountHierarchyLevel(request.LevelNumber, request.NameAr, request.NameEn, request.CanPost);
                store.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new AccountHierarchyLevelResponse(entity.Id, entity.LevelNumber, entity.NameAr, entity.NameEn, entity.CanPost, entity.IsDeleted, Convert.ToBase64String(entity.RowVersion)));
            },
            cancellationToken);
    }
}
public sealed class UpdateAccountHierarchyLevelCommandHandler(IAccountHierarchyLevelStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateAccountHierarchyLevelCommand, Result<AccountHierarchyLevelResponse>>
{
    public async Task<Result<AccountHierarchyLevelResponse>> Handle(UpdateAccountHierarchyLevelCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountHierarchyLevelResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("AccountHierarchyLevels", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId)
            ],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted) return Result.Failure<AccountHierarchyLevelResponse>(errors.NotFound("AccountHierarchyLevel"));
                if (await store.LevelNumberExistsAsync(request.LevelNumber, request.Id, token)) return Result.Failure<AccountHierarchyLevelResponse>(errors.Duplicate("AccountHierarchyLevel"));
                if (!request.CanPost && await store.HasPostingAccountsAsync(request.Id, token)) return Result.Failure<AccountHierarchyLevelResponse>(errors.HierarchyLevelPostingInUse);
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                entity.Update(request.LevelNumber, request.NameAr, request.NameEn, request.CanPost);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(new AccountHierarchyLevelResponse(entity.Id, entity.LevelNumber, entity.NameAr, entity.NameEn, entity.CanPost, entity.IsDeleted, Convert.ToBase64String(entity.RowVersion)));
            },
            cancellationToken);
    }
}

public sealed record CreateAccountCommand(AccountRequest Data) : ICommand<Result<AccountResponse>>;
public sealed record UpdateAccountCommand(int Id, AccountRequest Data) : ICommand<Result<AccountResponse>>;
public sealed record ArchiveAccountCommand(int Id, string RowVersion) : ICommand<Result>;
public sealed record RestoreAccountCommand(int Id, string RowVersion) : ICommand<Result<AccountResponse>>;
public sealed class AccountRequestValidator : AbstractValidator<AccountRequest>
{ public AccountRequestValidator() { RuleFor(item => item.Code).NotEmpty().MaximumLength(50); RuleFor(item => item.NameAr).NotEmpty().MaximumLength(200); RuleFor(item => item.NameEn).NotEmpty().MaximumLength(200); RuleFor(item => item.AccountHierarchyLevelId).GreaterThan(0); RuleFor(item => item.ManualPostingPolicy).IsInEnum(); RuleFor(item => item.CurrencyPolicy).IsInEnum(); RuleFor(item => item.RowVersion).Must(value => value is null || LedgerSetupCommandSupport.ValidVersion(value)); } }
public sealed class CreateAccountCommandValidator : AbstractValidator<CreateAccountCommand> { public CreateAccountCommandValidator() => RuleFor(item => item.Data).SetValidator(new AccountRequestValidator()); }
public sealed class UpdateAccountCommandValidator : AbstractValidator<UpdateAccountCommand> { public UpdateAccountCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.Data).SetValidator(new AccountRequestValidator()); RuleFor(item => item.Data.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class ArchiveAccountCommandValidator : AbstractValidator<ArchiveAccountCommand> { public ArchiveAccountCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }
public sealed class RestoreAccountCommandValidator : AbstractValidator<RestoreAccountCommand> { public RestoreAccountCommandValidator() { RuleFor(item => item.Id).GreaterThan(0); RuleFor(item => item.RowVersion).Must(LedgerSetupCommandSupport.ValidVersion); } }

public sealed class CreateAccountCommandHandler(IAccountWriteStore writeStore, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<CreateAccountCommand, Result<AccountResponse>>
{
    public async Task<Result<AccountResponse>> Handle(CreateAccountCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Currencies", tenantId, companyId)
            ],
            async token =>
            {
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, null, token)) return Result.Failure<AccountResponse>(errors.Duplicate("Account"));
                var level = await writeStore.GetLevelAsync(data.AccountHierarchyLevelId, token);
                if (level is null) return Result.Failure<AccountResponse>(errors.InvalidReference("AccountHierarchyLevel"));
                if (data.ParentAccountId is int parentId)
                {
                    if (parentId <= 0) return Result.Failure<AccountResponse>(errors.InvalidHierarchy);
                    var parent = await writeStore.GetForUpdateAsync(parentId, token);
                    if (parent is null || parent.IsDeleted) return Result.Failure<AccountResponse>(errors.InvalidReference("ParentAccount"));
                    try { parent.EnsureCanAcceptChild(); }
                    catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                }
                if (data.CurrencyPolicy == Domain.Finance.LedgerSetup.Enums.AccountCurrencyPolicy.SpecificCurrency &&
                    (!data.SpecificCurrencyId.HasValue || !await writeStore.CurrencyExistsAsync(data.SpecificCurrencyId.Value, token)))
                    return Result.Failure<AccountResponse>(errors.InvalidReference("Currency"));
                var entity = new Account(code, data.NameAr, data.NameEn, data.AccountHierarchyLevelId, data.ParentAccountId, data.AllowPosting, data.ManualPostingPolicy, data.CurrencyPolicy, data.SpecificCurrencyId);
                try { entity.EnsureLevelAllowsPosting(level.CanPost); }
                catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                entity.TenantId = tenantId;
                entity.CompanyId = companyId;
                writeStore.Add(entity);
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupProjectionForApplication.Account(entity));
            },
            cancellationToken);
    }
}
public sealed class UpdateAccountCommandHandler(IAccountWriteStore writeStore, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<UpdateAccountCommand, Result<AccountResponse>>
{
    public async Task<Result<AccountResponse>> Handle(UpdateAccountCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Currencies", tenantId, companyId)
            ],
            async token =>
            {
                var entity = await writeStore.GetForUpdateAsync(request.Id, token);
                if (entity is null || entity.IsDeleted) return Result.Failure<AccountResponse>(errors.NotFound("Account"));
                var data = request.Data;
                var code = data.Code.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, request.Id, token)) return Result.Failure<AccountResponse>(errors.Duplicate("Account"));
                var level = await writeStore.GetLevelAsync(data.AccountHierarchyLevelId, token);
                if (level is null) return Result.Failure<AccountResponse>(errors.InvalidReference("AccountHierarchyLevel"));
                if (data.ParentAccountId == entity.Id) return Result.Failure<AccountResponse>(errors.InvalidHierarchy);
                if (data.ParentAccountId is int parentId)
                {
                    var parent = await writeStore.GetForUpdateAsync(parentId, token);
                    if (parent is null || parent.IsDeleted) return Result.Failure<AccountResponse>(errors.InvalidReference("ParentAccount"));
                    if (await writeStore.CreatesCycleAsync(entity.Id, parentId, token)) return Result.Failure<AccountResponse>(errors.InvalidHierarchy);
                    try { parent.EnsureCanAcceptChild(); }
                    catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                }
                if (data.CurrencyPolicy == Domain.Finance.LedgerSetup.Enums.AccountCurrencyPolicy.SpecificCurrency &&
                    (!data.SpecificCurrencyId.HasValue || !await writeStore.CurrencyExistsAsync(data.SpecificCurrencyId.Value, token)))
                    return Result.Failure<AccountResponse>(errors.InvalidReference("Currency"));
                if (data.AllowPosting && await writeStore.HasChildrenAsync(entity.Id, token)) return Result.Failure<AccountResponse>(errors.InvalidHierarchy);
                writeStore.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(data.RowVersion!));
                entity.Update(code, data.NameAr, data.NameEn, data.AccountHierarchyLevelId, data.ParentAccountId, data.AllowPosting, data.ManualPostingPolicy, data.CurrencyPolicy, data.SpecificCurrencyId);
                try { entity.EnsureLevelAllowsPosting(level.CanPost); }
                catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success(LedgerSetupProjectionForApplication.Account(entity));
            },
            cancellationToken);
    }
}
public sealed class ArchiveAccountCommandHandler(IAccountWriteStore store, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, TimeProvider timeProvider, LedgerSetupErrors errors) : ICommandHandler<ArchiveAccountCommand, Result>
{
    public async Task<Result> Handle(ArchiveAccountCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId)],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null) return Result.Failure(errors.NotFound("Account"));
                if (entity.IsDeleted) return Result.Success();
                if (await store.HasChildrenAsync(request.Id, token) || await store.IsReferencedAsync(request.Id, token)) return Result.Failure(errors.InUse("Account"));
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                entity.IsDeleted = true;
                entity.DeletedById = actor.UserId;
                entity.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                await unitOfWork.SaveChangesAsync(token);
                return Result.Success();
            },
            cancellationToken);
    }
}
public sealed class RestoreAccountCommandHandler(IAccountWriteStore store, IAccountReadStore readStore, IAccountingUnitOfWork unitOfWork, ICurrentActor actor, LedgerSetupErrors errors) : ICommandHandler<RestoreAccountCommand, Result<AccountResponse>>
{
    public async Task<Result<AccountResponse>> Handle(RestoreAccountCommand request, CancellationToken cancellationToken)
    {
        if (!LedgerSetupCommandSupport.Scope(actor, out var tenantId, out var companyId)) return Result.Failure<AccountResponse>(errors.ScopeRequired);
        return await unitOfWork.ExecuteAtomicallyAsync(
            [
                LedgerSetupCommandSupport.CompanyResource("Accounts", tenantId, companyId),
                LedgerSetupCommandSupport.CompanyResource("Currencies", tenantId, companyId)
            ],
            async token =>
            {
                var entity = await store.GetForUpdateAsync(request.Id, token);
                if (entity is null) return Result.Failure<AccountResponse>(errors.NotFound("Account"));
                if (!entity.IsDeleted)
                {
                    var current = await readStore.GetByIdAsync(request.Id, token);
                    return current is null ? Result.Failure<AccountResponse>(errors.NotFound("Account")) : Result.Success(current);
                }
                if (await store.CodeExistsAsync(entity.Code, entity.Id, token)) return Result.Failure<AccountResponse>(errors.Duplicate("Account"));
                var level = await store.GetLevelAsync(entity.AccountHierarchyLevelId, token);
                if (level is null) return Result.Failure<AccountResponse>(errors.InvalidReference("AccountHierarchyLevel"));
                if (entity.ParentAccountId is int parentId)
                {
                    var parent = await store.GetForUpdateAsync(parentId, token);
                    if (parent is null || parent.IsDeleted) return Result.Failure<AccountResponse>(errors.InvalidReference("ParentAccount"));
                    try { parent.EnsureCanAcceptChild(); }
                    catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                }
                if (entity.CurrencyPolicy == Domain.Finance.LedgerSetup.Enums.AccountCurrencyPolicy.SpecificCurrency &&
                    (!entity.SpecificCurrencyId.HasValue || !await store.CurrencyExistsAsync(entity.SpecificCurrencyId.Value, token)))
                    return Result.Failure<AccountResponse>(errors.InvalidReference("Currency"));
                if (entity.AllowPosting && await store.HasChildrenAsync(entity.Id, token)) return Result.Failure<AccountResponse>(errors.InvalidHierarchy);
                try { entity.EnsureLevelAllowsPosting(level.CanPost); }
                catch (DomainRuleException) { return Result.Failure<AccountResponse>(errors.InvalidHierarchy); }
                store.ApplyOriginalRowVersion(entity, LedgerSetupCommandSupport.Version(request.RowVersion));
                entity.IsDeleted = false;
                entity.DeletedById = null;
                entity.DeletedOn = null;
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(request.Id, token);
                return response is null ? Result.Failure<AccountResponse>(errors.NotFound("Account")) : Result.Success(response);
            },
            cancellationToken);
    }
}

internal static class LedgerSetupProjectionForApplication
{
    public static AccountResponse Account(Account item) => new(item.Id, item.Code, item.NameAr, item.NameEn, item.AccountHierarchyLevelId, item.ParentAccountId, item.AllowPosting, item.ManualPostingPolicy, item.CurrencyPolicy, item.SpecificCurrencyId, item.IsDeleted, item.CreatedOn, item.UpdatedOn, Convert.ToBase64String(item.RowVersion));
}
