using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;

namespace ErpSystem.Modules.CRM.Infrastructure.Features.Appointments.Persistence;

public sealed class AppointmentReadStore(
    CrmDbContext context,
    ICurrentActor currentActor) : IAppointmentReadStore
{
    public async Task<IReadOnlyList<AppointmentResponse>> GetAllAsync(
        DateTimeOffset? rangeStart,
        DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken)
    {
        var scope = AppointmentScope.Require(currentActor);
        var query = context.Appointments
            .AsNoTracking()
            .Where(appointment =>
                appointment.TenantId == scope.TenantId &&
                appointment.CompanyId == scope.CompanyId &&
                appointment.CreatedById == scope.UserId);

        if (rangeStart.HasValue)
            query = query.Where(appointment => appointment.End > rangeStart.Value);
        if (rangeEnd.HasValue)
            query = query.Where(appointment => appointment.Start < rangeEnd.Value);

        return await query
            .OrderBy(appointment => appointment.Start)
            .Select(appointment => new AppointmentResponse(
                appointment.Id,
                appointment.Start,
                appointment.End,
                appointment.Text,
                appointment.IsAllDay))
            .ToListAsync(cancellationToken);
    }
}

public sealed class AppointmentRepository(
    CrmDbContext context,
    ICurrentActor currentActor) : IAppointmentRepository
{
    public void Add(Appointment appointment) => context.Appointments.Add(appointment);

    public Task<Appointment?> GetOwnedForUpdateAsync(int id, CancellationToken cancellationToken)
    {
        var scope = AppointmentScope.Require(currentActor);
        return context.Appointments.FirstOrDefaultAsync(
            appointment =>
                appointment.Id == id &&
                appointment.TenantId == scope.TenantId &&
                appointment.CompanyId == scope.CompanyId &&
                appointment.CreatedById == scope.UserId,
            cancellationToken);
    }

    public void Remove(Appointment appointment) => context.Appointments.Remove(appointment);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken) =>
        context.SaveChangesAsync(cancellationToken);
}
