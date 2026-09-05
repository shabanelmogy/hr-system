using HrManagementSystem.Application.Features.Finance.FiscalYears.Contracts;

namespace HrManagementSystem.Application.Features.Finance.FiscalYears.Abstractions;

public interface IFiscalYearChangeScheduler
{
    void Schedule(FiscalYearChange change);
}

public sealed record FiscalYearChange(
    FiscalYearDetailResponse FiscalYear,
    string Action,
    string TenantId,
    int CompanyId,
    string? ActorUserId,
    Guid OperationId);
