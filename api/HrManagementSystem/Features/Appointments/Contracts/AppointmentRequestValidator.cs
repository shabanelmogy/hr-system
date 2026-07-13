namespace HrManagementSystem.Features.Appointments.Contracts;

public class AppointmentRequestValidator : AbstractValidator<AppointmentRequest>
{
    private readonly IStringLocalizer<AppointmentRequest> _localizer;

    public AppointmentRequestValidator(IStringLocalizer<AppointmentRequest> localizer)
    {
        _localizer = localizer;

        RuleFor(a => a.Text)
            .Trimmed()
            .NotEmpty()
            .WithMessage(_localizer[Strings.Required])
            .Length(3, 200)
            .WithMessage(_localizer[Strings.MaxLengthError]);

        RuleFor(a => a.Start)
            .LessThan(a => a.End)
            .WithMessage(_localizer[Strings.StartEndDateValidation]);

        //RuleFor(a => a)
        //    .Must(a => !IsTextDuplicatedInDateRange(a))
        //    .WithMessage(_localizer["DuplicatedValue"]);
    }

    //private bool IsTextDuplicatedInDateRange(AppointmentRequest appointment)
    //{
    //    return _dbContext.Appointments.Any(a =>
    //        a.Text == appointment.Text &&
    //        a.Id != appointment.Id &&
    //        (
    //            (appointment.Start >= a.Start && appointment.Start < a.End) || // Overlaps at the start
    //            (appointment.End > a.Start && appointment.End <= a.End) ||    // Overlaps at the end
    //            (appointment.Start <= a.Start && appointment.End >= a.End)    // Fully overlaps
    //        ));
    //}
}
