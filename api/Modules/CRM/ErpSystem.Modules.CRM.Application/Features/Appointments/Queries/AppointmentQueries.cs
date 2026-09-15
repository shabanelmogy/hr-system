using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;

namespace ErpSystem.Modules.CRM.Application.Features.Appointments.Queries;

public sealed record GetAppointmentsQuery(
    DateTimeOffset? RangeStart,
    DateTimeOffset? RangeEnd) : IQuery<IReadOnlyList<AppointmentResponse>>;

public sealed class GetAppointmentsQueryHandler(IAppointmentReadStore readStore)
    : IQueryHandler<GetAppointmentsQuery, IReadOnlyList<AppointmentResponse>>
{
    public Task<IReadOnlyList<AppointmentResponse>> Handle(
        GetAppointmentsQuery query,
        CancellationToken cancellationToken) =>
        readStore.GetAllAsync(query.RangeStart, query.RangeEnd, cancellationToken);
}
