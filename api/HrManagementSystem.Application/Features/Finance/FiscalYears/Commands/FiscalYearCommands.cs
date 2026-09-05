using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Errors;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Mapping;
using HrManagementSystem.Application.Features.Finance.FiscalYears.Validation;
using HrManagementSystem.Domain.Common.Exceptions;
using HrManagementSystem.Domain.Finance.FiscalYears.Entities;
using HrManagementSystem.Domain.Finance.FiscalYears.Enums;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Commands;

public sealed record CreateFiscalYearCommand(
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency)
    : FiscalYearMutation(Code, NameAr, NameEn, StartDate, EndDate, PeriodFrequency),
      ICommand<Result<FiscalYearDetailResponse>>;

public sealed record UpdateFiscalYearCommand(
    int Id,
    string Code,
    string NameAr,
    string NameEn,
    DateOnly StartDate,
    DateOnly EndDate,
    FiscalPeriodFrequency PeriodFrequency,
    string RowVersion)
    : FiscalYearMutation(Code, NameAr, NameEn, StartDate, EndDate, PeriodFrequency),
      ICommand<Result<FiscalYearDetailResponse>>;

public sealed record ArchiveFiscalYearCommand(int Id) : ICommand<Result>;
public sealed record RestoreFiscalYearCommand(int Id, string RowVersion) : ICommand<Result<FiscalYearDetailResponse>>;

public enum FiscalYearLifecycleAction
{
    Open,
    BeginClosing,
    Close,
    Lock
}

public sealed record ChangeFiscalYearLifecycleCommand(
    int Id,
    string RowVersion,
    FiscalYearLifecycleAction Action) : ICommand<Result<FiscalYearDetailResponse>>;

public sealed class CreateFiscalYearCommandValidator : FiscalYearMutationValidator<CreateFiscalYearCommand>
{
    public CreateFiscalYearCommandValidator(IStringLocalizer<CreateFiscalYearRequest> localizer) : base(localizer) { }
}

public sealed class UpdateFiscalYearCommandValidator : FiscalYearMutationValidator<UpdateFiscalYearCommand>
{
    public UpdateFiscalYearCommandValidator(IStringLocalizer<CreateFiscalYearRequest> localizer) : base(localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion)
            .Must(FiscalYearValidation.IsValidRowVersion)
            .WithMessage(localizer["FiscalYearRowVersionInvalid"]);
    }
}

public sealed class ArchiveFiscalYearCommandValidator : AbstractValidator<ArchiveFiscalYearCommand>
{
    public ArchiveFiscalYearCommandValidator() => RuleFor(command => command.Id).GreaterThan(0);
}

public sealed class RestoreFiscalYearCommandValidator : AbstractValidator<RestoreFiscalYearCommand>
{
    public RestoreFiscalYearCommandValidator(IStringLocalizer<CreateFiscalYearRequest> localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion)
            .Must(FiscalYearValidation.IsValidRowVersion)
            .WithMessage(localizer["FiscalYearRowVersionInvalid"]);
    }
}

public sealed class ChangeFiscalYearLifecycleCommandValidator : AbstractValidator<ChangeFiscalYearLifecycleCommand>
{
    public ChangeFiscalYearLifecycleCommandValidator(IStringLocalizer<CreateFiscalYearRequest> localizer)
    {
        RuleFor(command => command.Id).GreaterThan(0);
        RuleFor(command => command.RowVersion)
            .Must(FiscalYearValidation.IsValidRowVersion)
            .WithMessage(localizer["FiscalYearRowVersionInvalid"]);
        RuleFor(command => command.Action).IsInEnum();
    }
}

public sealed class CreateFiscalYearCommandHandler(
    IFiscalYearWriteStore writeStore,
    IFiscalYearReadStore readStore,
    IUnitOfWork unitOfWork,
    IFiscalYearChangeScheduler scheduler,
    ICurrentActor actor,
    FiscalYearErrors errors)
    : ICommandHandler<CreateFiscalYearCommand, Result<FiscalYearDetailResponse>>
{
    public async Task<Result<FiscalYearDetailResponse>> Handle(CreateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        if (!FiscalYearCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearCompanyContextRequired);

        FiscalYearChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [FiscalYearLocks.CompanyCalendar(tenantId, companyId)],
            async token =>
            {
                var code = request.Code.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, null, token))
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearDuplicateCode);
                if (await writeStore.OverlapExistsAsync(request.StartDate, request.EndDate, null, token))
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearOverlappingDates);

                var fiscalYear = new FiscalYear(code, request.NameAr, request.NameEn, request.StartDate, request.EndDate, request.PeriodFrequency);
                fiscalYear.TenantId = tenantId;
                fiscalYear.CompanyId = companyId;
                writeStore.Add(fiscalYear);
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(fiscalYear.Id, token)
                    ?? throw new InvalidOperationException("The newly created fiscal year could not be read.");
                change = FiscalYearCommandSupport.Change(response, "Add", tenantId, companyId, actor.UserId);
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null) scheduler.Schedule(change);
        return result;
    }
}

public sealed class UpdateFiscalYearCommandHandler(
    IFiscalYearWriteStore writeStore,
    IFiscalYearReadStore readStore,
    IFiscalYearAuditTrail auditTrail,
    IUnitOfWork unitOfWork,
    IFiscalYearChangeScheduler scheduler,
    ICurrentActor actor,
    FiscalYearErrors errors)
    : ICommandHandler<UpdateFiscalYearCommand, Result<FiscalYearDetailResponse>>
{
    public async Task<Result<FiscalYearDetailResponse>> Handle(UpdateFiscalYearCommand request, CancellationToken cancellationToken)
    {
        if (!FiscalYearCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearCompanyContextRequired);

        FiscalYearChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [FiscalYearLocks.CompanyCalendar(tenantId, companyId)],
            async token =>
            {
                var fiscalYear = await writeStore.GetForUpdateAsync(request.Id, token);
                if (fiscalYear is null || fiscalYear.IsDeleted)
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotFound);
                if (fiscalYear.Status != FiscalYearStatus.Draft)
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotEditable);

                var code = request.Code.Trim().ToUpperInvariant();
                if (await writeStore.CodeExistsAsync(code, fiscalYear.Id, token))
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearDuplicateCode);
                if (await writeStore.OverlapExistsAsync(request.StartDate, request.EndDate, fiscalYear.Id, token))
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearOverlappingDates);

                var candidate = new FiscalYear(code, request.NameAr, request.NameEn, request.StartDate, request.EndDate, request.PeriodFrequency);
                auditTrail.RecordUpdate(fiscalYear, candidate);
                writeStore.ApplyOriginalRowVersion(fiscalYear, Convert.FromBase64String(request.RowVersion));
                var oldPeriods = fiscalYear.Periods.ToHashSet();
                fiscalYear.UpdateDraft(code, request.NameAr, request.NameEn, request.StartDate, request.EndDate, request.PeriodFrequency);
                writeStore.RemovePeriods(oldPeriods.Except(fiscalYear.Periods).ToArray());
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(fiscalYear.Id, token)
                    ?? throw new InvalidOperationException("The updated fiscal year could not be read.");
                change = FiscalYearCommandSupport.Change(response, "Update", tenantId, companyId, actor.UserId);
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null) scheduler.Schedule(change);
        return result;
    }
}

public sealed class ArchiveFiscalYearCommandHandler(
    IFiscalYearWriteStore writeStore,
    IUnitOfWork unitOfWork,
    IFiscalYearChangeScheduler scheduler,
    ICurrentActor actor,
    TimeProvider timeProvider,
    FiscalYearErrors errors)
    : ICommandHandler<ArchiveFiscalYearCommand, Result>
{
    public async Task<Result> Handle(ArchiveFiscalYearCommand request, CancellationToken cancellationToken)
    {
        if (!FiscalYearCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure(errors.FiscalYearCompanyContextRequired);

        FiscalYearChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [FiscalYearLocks.CompanyCalendar(tenantId, companyId)],
            async token =>
            {
                var fiscalYear = await writeStore.GetForUpdateAsync(request.Id, token);
                if (fiscalYear is null) return Result.Failure(errors.FiscalYearNotFound);
                if (fiscalYear.IsDeleted) return Result.Success();
                if (fiscalYear.Status != FiscalYearStatus.Draft)
                    return Result.Failure(errors.FiscalYearNotArchivable);

                fiscalYear.IsDeleted = true;
                fiscalYear.DeletedById = actor.UserId;
                fiscalYear.DeletedByPc = Environment.MachineName;
                fiscalYear.DeletedOn = timeProvider.GetUtcNow().UtcDateTime;
                await unitOfWork.SaveChangesAsync(token);
                change = FiscalYearCommandSupport.Change(FiscalYearResponseMapper.ToDetail(fiscalYear), "Archive", tenantId, companyId, actor.UserId);
                return Result.Success();
            },
            cancellationToken);

        if (change is not null) scheduler.Schedule(change);
        return result;
    }
}

public sealed class RestoreFiscalYearCommandHandler(
    IFiscalYearWriteStore writeStore,
    IFiscalYearReadStore readStore,
    IUnitOfWork unitOfWork,
    IFiscalYearChangeScheduler scheduler,
    ICurrentActor actor,
    FiscalYearErrors errors)
    : ICommandHandler<RestoreFiscalYearCommand, Result<FiscalYearDetailResponse>>
{
    public async Task<Result<FiscalYearDetailResponse>> Handle(RestoreFiscalYearCommand request, CancellationToken cancellationToken)
    {
        if (!FiscalYearCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearCompanyContextRequired);

        FiscalYearChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [FiscalYearLocks.CompanyCalendar(tenantId, companyId)],
            async token =>
            {
                var fiscalYear = await writeStore.GetForUpdateAsync(request.Id, token);
                if (fiscalYear is null) return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotFound);
                if (!fiscalYear.IsDeleted)
                    return Result.Success(FiscalYearResponseMapper.ToDetail(fiscalYear));
                if (fiscalYear.Status != FiscalYearStatus.Draft)
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotRestorable);
                if (await writeStore.OverlapExistsAsync(fiscalYear.StartDate, fiscalYear.EndDate, fiscalYear.Id, token))
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearOverlappingDates);

                writeStore.ApplyOriginalRowVersion(fiscalYear, Convert.FromBase64String(request.RowVersion));
                fiscalYear.IsDeleted = false;
                fiscalYear.DeletedById = null;
                fiscalYear.DeletedByPc = null;
                fiscalYear.DeletedOn = null;
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(fiscalYear.Id, token)
                    ?? throw new InvalidOperationException("The restored fiscal year could not be read.");
                change = FiscalYearCommandSupport.Change(response, "Restore", tenantId, companyId, actor.UserId);
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null) scheduler.Schedule(change);
        return result;
    }
}

public sealed class ChangeFiscalYearLifecycleCommandHandler(
    IFiscalYearWriteStore writeStore,
    IFiscalYearReadStore readStore,
    IFiscalYearAuditTrail auditTrail,
    IUnitOfWork unitOfWork,
    IFiscalYearChangeScheduler scheduler,
    ICurrentActor actor,
    FiscalYearErrors errors)
    : ICommandHandler<ChangeFiscalYearLifecycleCommand, Result<FiscalYearDetailResponse>>
{
    public async Task<Result<FiscalYearDetailResponse>> Handle(ChangeFiscalYearLifecycleCommand request, CancellationToken cancellationToken)
    {
        if (!FiscalYearCommandSupport.TryGetScope(actor, out var tenantId, out var companyId))
            return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearCompanyContextRequired);

        FiscalYearChange? change = null;
        var result = await unitOfWork.ExecuteAtomicallyAsync(
            [FiscalYearLocks.CompanyCalendar(tenantId, companyId)],
            async token =>
            {
                var fiscalYear = await writeStore.GetForUpdateAsync(request.Id, token);
                if (fiscalYear is null || fiscalYear.IsDeleted)
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearNotFound);

                var oldStatus = fiscalYear.Status.ToString();
                writeStore.ApplyOriginalRowVersion(fiscalYear, Convert.FromBase64String(request.RowVersion));
                try
                {
                    var changed = request.Action switch
                    {
                        FiscalYearLifecycleAction.Open => fiscalYear.Open(),
                        FiscalYearLifecycleAction.BeginClosing => fiscalYear.BeginClosing(),
                        FiscalYearLifecycleAction.Close => fiscalYear.Close(),
                        FiscalYearLifecycleAction.Lock => fiscalYear.Lock(),
                        _ => throw new ArgumentOutOfRangeException(nameof(request.Action))
                    };

                    if (!changed)
                        return Result.Success(FiscalYearResponseMapper.ToDetail(fiscalYear));
                }
                catch (DomainRuleException)
                {
                    return Result.Failure<FiscalYearDetailResponse>(errors.FiscalYearInvalidTransition);
                }

                auditTrail.RecordLifecycle(fiscalYear, oldStatus, fiscalYear.Status.ToString());
                await unitOfWork.SaveChangesAsync(token);
                var response = await readStore.GetByIdAsync(fiscalYear.Id, token)
                    ?? throw new InvalidOperationException("The fiscal year lifecycle result could not be read.");
                change = FiscalYearCommandSupport.Change(response, "Update", tenantId, companyId, actor.UserId);
                return Result.Success(response);
            },
            cancellationToken);

        if (change is not null) scheduler.Schedule(change);
        return result;
    }
}

internal static class FiscalYearCommandSupport
{
    public static bool TryGetScope(ICurrentActor actor, out string tenantId, out int companyId)
    {
        tenantId = actor.TenantId ?? string.Empty;
        companyId = actor.CompanyId.GetValueOrDefault();
        return tenantId.Length > 0 && companyId > 0;
    }

    public static FiscalYearChange Change(
        FiscalYearDetailResponse response,
        string action,
        string tenantId,
        int companyId,
        string? actorUserId) =>
        new(response, action, tenantId, companyId, actorUserId, Guid.NewGuid());
}
