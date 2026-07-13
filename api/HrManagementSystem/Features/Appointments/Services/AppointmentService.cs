using HrManagementSystem.Features.Appointments.Contracts;
using HrManagementSystem.Features.Appointments.Errors;

namespace HrManagementSystem.Features.Appointments.Services;

public class AppointmentService(
    ApplicationDbContext context,
    IHttpContextAccessor httpContextAccessor,
    IEntityChangeLogService entityChangeLogService,
    AppointmentErrors serverErrors,
    IStringLocalizer<AppointmentRequest> localizer,
    IMapper mapper) : IAppointmentService
{
    private readonly ApplicationDbContext _context = context;
    private readonly IMapper _mapper = mapper;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEntityChangeLogService _entityChangeLogService = entityChangeLogService;
    private readonly AppointmentErrors _appointmentErrors = serverErrors;
    private readonly IStringLocalizer<AppointmentRequest> _localizer = localizer;

    public async Task<IEnumerable<AppointmentResponse>> GetAllAsync(string userId, CancellationToken cancellationToken = default)
    {
        var appointments = await _context.Appointments
                                          .Where(a => a.CreatedById == userId)
                                          .AsNoTracking()
                                          .ProjectToType<AppointmentResponse>()
                                          .ToListAsync(cancellationToken);

        return appointments;
    }

    public async Task<Result<AppointmentResponse>> AddAsync(AppointmentRequest appointmentRequest, CancellationToken cancellationToken = default)
    {
        var appointment = _mapper.Map<Appointment>(appointmentRequest);

        await _context.Appointments.AddAsync(appointment, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var response = appointment.Adapt<AppointmentResponse>();
        return Result.Success(response);
    }

    public async Task<Result<AppointmentResponse>> UpdateAsync(AppointmentRequest request,CancellationToken cancellationToken = default)
    {
        var currentAppointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (currentAppointment is null)
            return Result.Failure<AppointmentResponse>(_appointmentErrors.AppointmentNotFound);

         _mapper.Map(request, currentAppointment);

        _context.Appointments.Update(currentAppointment);
        await _context.SaveChangesAsync(cancellationToken);

        var respone = currentAppointment.Adapt<AppointmentResponse>();

        return Result.Success(respone);
    }

    public async Task<Result> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        //get current appointment
        var currentAppointment = await _context.Appointments.FirstOrDefaultAsync(a => a.Id == id);
        
        //check if it exists
        if (currentAppointment is null)
            return Result.Failure(_appointmentErrors.AppointmentNotFound);

        //delete it
        _context.Appointments.Remove(currentAppointment);

        //save changes
        await _context.SaveChangesAsync(cancellationToken);

        //return response
        return Result.Success();
    }
}

