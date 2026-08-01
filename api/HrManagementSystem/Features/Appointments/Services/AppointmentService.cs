using HrManagementSystem.Features.Appointments.Contracts;
using HrManagementSystem.Features.Appointments.Errors;
using HrManagementSystem.Features.Appointments.Entities;

namespace HrManagementSystem.Features.Appointments.Services;

public class AppointmentService(
    ApplicationDbContext context,
    AppointmentErrors serverErrors,
    IMapper mapper) : IAppointmentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly AppointmentErrors _appointmentErrors = serverErrors;

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
        return Result.Success();
    }

    private static AppointmentRequest NormalizeDateTimes(AppointmentRequest request) =>
        request with
        {
            Start = request.Start.ToUniversalTime(),
            End = request.End.ToUniversalTime(),
        };
}

