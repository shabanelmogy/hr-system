namespace HrManagementSystem.Application.Abstractions.Authentication;

public interface ICurrentActorScope
{
    IDisposable BeginScope(string userId, string tenantId, int? companyId = null);
}
