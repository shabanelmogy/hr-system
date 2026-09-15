using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;
using ErpSystem.Modules.CRM.Domain.Appointments.Entities;

namespace ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;

public interface IAppointmentReadStore
{
    Task<IReadOnlyList<AppointmentResponse>> GetAllAsync(
        DateTimeOffset? rangeStart,
        DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken);
}

public interface IAppointmentRepository
{
    void Add(Appointment appointment);
    Task<Appointment?> GetOwnedForUpdateAsync(int id, CancellationToken cancellationToken);
    void Remove(Appointment appointment);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IAppointmentChangeScheduler
{
    void Schedule(int appointmentId, string action);
}
