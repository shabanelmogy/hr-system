namespace ErpSystem.Modules.CRM.Infrastructure.Features.Appointments;

internal readonly record struct AppointmentScope(string UserId, string TenantId, int CompanyId)
{
    public static AppointmentScope Require(ICurrentActor actor)
    {
        if (string.IsNullOrWhiteSpace(actor.UserId) ||
            string.IsNullOrWhiteSpace(actor.TenantId) ||
            actor.CompanyId is null or <= 0)
        {
            throw new InvalidOperationException(
                "A user, tenant, and company are required for appointment access.");
        }

        return new AppointmentScope(actor.UserId, actor.TenantId, actor.CompanyId.Value);
    }
}
