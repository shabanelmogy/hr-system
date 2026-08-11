using HrManagementSystem.Application.Features.Appointments.Services;
using HrManagementSystem.Application.Features.Appointments.Contracts;
using HrManagementSystem.Application.Features.Appointments.Errors;
using HrManagementSystem.Domain.Appointments.Entities;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Infrastructure.Features.Appointments.Jobs;

namespace HrManagementSystem.Infrastructure.Features.Appointments.Services;

public class AppointmentService(
    ApplicationDbContext context,
    AppointmentErrors serverErrors,
    ICurrentActor currentActor,
    IMapper mapper) : IAppointmentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly AppointmentErrors _appointmentErrors = serverErrors;
    private readonly ICurrentActor _currentActor = currentActor;

    public async Task<IEnumerable<AppointmentResponse>> GetAllAsync(
        string userId,
        DateTimeOffset? rangeStart,
        DateTimeOffset? rangeEnd,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Appointments
            .Where(appointment => appointment.CreatedById == userId)
            .AsNoTracking();

        if (rangeStart.HasValue)
            query = query.Where(appointment => appointment.End > rangeStart.Value);

        if (rangeEnd.HasValue)
            query = query.Where(appointment => appointment.Start < rangeEnd.Value);

        var appointments = await query
            .OrderBy(appointment => appointment.Start)
            .ProjectToType<AppointmentResponse>()
            .ToListAsync(cancellationToken);

        return appointments;
    }

    public async Task<Result<AppointmentResponse>> AddAsync(AppointmentRequest appointmentRequest, CancellationToken cancellationToken = default)
    {
        var appointment = _mapper.Map<Appointment>(NormalizeDateTimes(appointmentRequest));

        await _context.Appointments.AddAsync(appointment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = appointment.Adapt<AppointmentResponse>();
        QueueAppointmentChanged(appointment.Id, "Add");
        return Result.Success(response);
    }

    public async Task<Result<AppointmentResponse>> UpdateAsync(
        AppointmentRequest request,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var currentAppointment = await _context.Appointments.FirstOrDefaultAsync(
            appointment => appointment.Id == request.Id && appointment.CreatedById == userId,
            cancellationToken);

        if (currentAppointment is null)
            return Result.Failure<AppointmentResponse>(_appointmentErrors.AppointmentNotFound);

        _mapper.Map(NormalizeDateTimes(request), currentAppointment);

        _context.Appointments.Update(currentAppointment);
        await _context.SaveChangesAsync(cancellationToken);

        var response = currentAppointment.Adapt<AppointmentResponse>();
        QueueAppointmentChanged(currentAppointment.Id, "Update");

        return Result.Success(response);
    }

    public async Task<Result> DeleteAsync(
        int id,
        string userId,
        CancellationToken cancellationToken = default)
    {
        var currentAppointment = await _context.Appointments.FirstOrDefaultAsync(
            appointment => appointment.Id == id && appointment.CreatedById == userId,
            cancellationToken);

        if (currentAppointment is null)
            return Result.Failure(_appointmentErrors.AppointmentNotFound);

        _context.Appointments.Remove(currentAppointment);
        await _context.SaveChangesAsync(cancellationToken);
        QueueAppointmentChanged(currentAppointment.Id, "Delete");
        return Result.Success();
    }

    private static AppointmentRequest NormalizeDateTimes(AppointmentRequest request) =>
        request with
        {
            Start = request.Start.ToUniversalTime(),
            End = request.End.ToUniversalTime(),
        };

    private void QueueAppointmentChanged(int appointmentId, string action)
    {
        var request = new AppointmentChangedJobRequest(
            appointmentId,
            action,
            _currentActor.UserId ?? throw new InvalidOperationException(
                "A user is required to publish appointment changes."),
            _currentActor.TenantId ?? throw new InvalidOperationException(
                "A tenant is required to publish appointment changes."),
            _currentActor.CompanyId ?? throw new InvalidOperationException(
                "A company is required to publish appointment changes."),
            Guid.NewGuid());

        BackgroundJob.Enqueue<AppointmentChangedJob>(
            job => job.ExecuteAsync(request, CancellationToken.None));
    }
}

