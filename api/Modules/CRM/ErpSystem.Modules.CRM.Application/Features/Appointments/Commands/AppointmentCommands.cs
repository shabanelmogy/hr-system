using ErpSystem.Modules.CRM.Application.Features.Appointments.Abstractions;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Contracts;
using ErpSystem.Modules.CRM.Application.Features.Appointments.Errors;
using ErpSystem.Modules.CRM.Domain.Appointments.Entities;

namespace ErpSystem.Modules.CRM.Application.Features.Appointments.Commands;

public sealed record CreateAppointmentCommand(AppointmentRequest Request)
    : ICommand<Result<AppointmentResponse>>;

public sealed record UpdateAppointmentCommand(UpdateAppointmentRequest Request)
    : ICommand<Result<AppointmentResponse>>;

public sealed record DeleteAppointmentCommand(int Id) : ICommand<Result>;

public sealed class CreateAppointmentCommandValidator : AbstractValidator<CreateAppointmentCommand>
{
    public CreateAppointmentCommandValidator(IValidator<AppointmentRequest> requestValidator) =>
        RuleFor(command => command.Request).SetValidator(requestValidator);
}

public sealed class UpdateAppointmentCommandValidator : AbstractValidator<UpdateAppointmentCommand>
{
    public UpdateAppointmentCommandValidator(IValidator<AppointmentRequest> requestValidator)
    {
        RuleFor(command => command.Request).SetValidator(requestValidator);
        RuleFor(command => command.Request.Id).GreaterThan(0);
    }
}

public sealed class CreateAppointmentCommandHandler(
    IAppointmentRepository repository,
    IAppointmentChangeScheduler changeScheduler)
    : ICommandHandler<CreateAppointmentCommand, Result<AppointmentResponse>>
{
    public async Task<Result<AppointmentResponse>> Handle(
        CreateAppointmentCommand command,
        CancellationToken cancellationToken)
    {
        var request = AppointmentSchedule.Normalize(command.Request);
        var appointment = new Appointment(request.Start, request.End, request.Text, request.IsAllDay);

        repository.Add(appointment);
        await repository.SaveChangesAsync(cancellationToken);
        changeScheduler.Schedule(appointment.Id, "Add");

        return Result.Success(AppointmentSchedule.ToResponse(appointment));
    }
}

public sealed class UpdateAppointmentCommandHandler(
    IAppointmentRepository repository,
    IAppointmentChangeScheduler changeScheduler,
    AppointmentErrors errors)
    : ICommandHandler<UpdateAppointmentCommand, Result<AppointmentResponse>>
{
    public async Task<Result<AppointmentResponse>> Handle(
        UpdateAppointmentCommand command,
        CancellationToken cancellationToken)
    {
        var appointment = await repository.GetOwnedForUpdateAsync(command.Request.Id, cancellationToken);
        if (appointment is null)
            return Result.Failure<AppointmentResponse>(errors.AppointmentNotFound);

        var request = AppointmentSchedule.Normalize(command.Request);
        appointment.UpdateText(request.Text);
        appointment.Reschedule(request.Start, request.End, request.IsAllDay);
        await repository.SaveChangesAsync(cancellationToken);
        changeScheduler.Schedule(appointment.Id, "Update");

        return Result.Success(AppointmentSchedule.ToResponse(appointment));
    }
}

public sealed class DeleteAppointmentCommandHandler(
    IAppointmentRepository repository,
    IAppointmentChangeScheduler changeScheduler,
    AppointmentErrors errors)
    : ICommandHandler<DeleteAppointmentCommand, Result>
{
    public async Task<Result> Handle(DeleteAppointmentCommand command, CancellationToken cancellationToken)
    {
        var appointment = await repository.GetOwnedForUpdateAsync(command.Id, cancellationToken);
        if (appointment is null)
            return Result.Failure(errors.AppointmentNotFound);

        repository.Remove(appointment);
        await repository.SaveChangesAsync(cancellationToken);
        changeScheduler.Schedule(appointment.Id, "Delete");
        return Result.Success();
    }
}

internal static class AppointmentSchedule
{
    public static AppointmentRequest Normalize(AppointmentRequest request) =>
        request with
        {
            Start = request.Start.ToUniversalTime(),
            End = request.End.ToUniversalTime()
        };

    public static AppointmentResponse ToResponse(Appointment appointment) =>
        new(
            appointment.Id,
            appointment.Start,
            appointment.End,
            appointment.Text,
            appointment.IsAllDay);
}
