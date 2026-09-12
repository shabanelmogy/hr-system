namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning;

public static class WorkforcePlanLocks
{
    public static string Company(string tenantId, int companyId) =>
        $"WorkforcePlanning:Plans:{tenantId}:{companyId}";

    public static string Envelope(string tenantId, int companyId, int envelopeId) =>
        $"WorkforcePlanning:Envelopes:{tenantId}:{companyId}:{envelopeId}";
}
