using HrManagementSystem.Features.Appointments.Contracts;

namespace HrManagementSystem.Features.Appointments.Services;

public interface IAppointmentService
{
    Task<IEnumerable<AppointmentResponse>> GetAllAsync(string userId,CancellationToken cancellationToken);
    Task<Result<AppointmentResponse>> AddAsync(AppointmentRequest appointment, CancellationToken cancellationToken);
    Task<Result<AppointmentResponse>> UpdateAsync(AppointmentRequest request, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default);
}
