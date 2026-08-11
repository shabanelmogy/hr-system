using HrManagementSystem.Application.Features.Appointments.Contracts;

namespace HrManagementSystem.Application.Features.Appointments.Services;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentResponse>> GetAllAsync(
        string userId,
        DateTimeOffset? rangeStart,
        DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken);
    Task<Result<AppointmentResponse>> AddAsync(AppointmentRequest appointment, CancellationToken cancellationToken);
    Task<Result<AppointmentResponse>> UpdateAsync(
        AppointmentRequest request,
        string userId,
        CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, string userId, CancellationToken cancellationToken = default);
}
