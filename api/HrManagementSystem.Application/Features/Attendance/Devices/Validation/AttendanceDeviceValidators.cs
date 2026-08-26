using System.Net;
using HrManagementSystem.Application.Features.Attendance.Devices.Commands;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Features.Attendance.Devices.Queries;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Validation;

internal static class AttendancePageValidation
{
    public static bool IsAllowedPageSize(int value) => value is 5 or 10 or 25 or 50;
}

public sealed class AttendanceDeviceRequestValidator : AbstractValidator<AttendanceDeviceRequest>
{
    public AttendanceDeviceRequestValidator(IStringLocalizer<AttendanceDeviceRequest> l)
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120).WithMessage(l["AttendanceDeviceInvalidRequest"]);
        RuleFor(x => x.ProviderId).Must(AttendanceProviderCatalog.IsKnown).WithMessage(l["AttendanceDeviceProviderUnavailable"]);
        RuleFor(x => x.Host).Must(x => !string.IsNullOrWhiteSpace(x) && IPAddress.TryParse(x.Trim(), out _))
            .WithMessage(l["AttendanceDeviceUntrustedHost"]);
        RuleFor(x => x.Port).InclusiveBetween(1, 65535).WithMessage(l["AttendanceDeviceInvalidRequest"]);
        RuleFor(x => x.BranchId).GreaterThan(0).When(x => x.BranchId.HasValue).WithMessage(l["AttendanceDeviceInvalidBranch"]);
        RuleFor(x => x.ConnectionMode).Equal("tcp").WithMessage(l["AttendanceDeviceInvalidRequest"]);
        RuleFor(x => x.TimeZoneId).Must(IsTimeZone).WithMessage(l["AttendanceDeviceInvalidTimeZone"]);
    }
    public static bool IsTimeZone(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length > 128) return false;
        try { _ = TimeZoneInfo.FindSystemTimeZoneById(value); return true; }
        catch (TimeZoneNotFoundException) { return false; }
        catch (InvalidTimeZoneException) { return false; }
    }
}
public sealed class CreateAttendanceDeviceValidator : AbstractValidator<CreateAttendanceDeviceCommand>
{
    public CreateAttendanceDeviceValidator(AttendanceDeviceRequestValidator validator) =>
        RuleFor(x => x.Request).NotNull().SetValidator(validator);
}
public sealed class UpdateAttendanceDeviceValidator : AbstractValidator<UpdateAttendanceDeviceCommand>
{
    public UpdateAttendanceDeviceValidator(AttendanceDeviceRequestValidator validator)
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Request).NotNull().SetValidator(validator);
    }
}
public sealed class DeviceCredentialsValidator : AbstractValidator<UpdateAttendanceDeviceCredentialsCommand>
{
    public DeviceCredentialsValidator(IStringLocalizer<AttendanceDeviceRequest> l)
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Request).NotNull();
        When(x => x.Request is not null, () =>
        {
            RuleFor(x => x.Request).Must(x => x.Password is null && x.Token is null &&
                int.TryParse(x.CommKey, NumberStyles.None, CultureInfo.InvariantCulture, out var value) && value >= 0)
                .WithMessage(l["AttendanceDeviceInvalidCredentials"]);
        });
    }
}
public sealed class StartPullValidator : AbstractValidator<StartAttendanceDevicePullCommand>
{
    public StartPullValidator(IStringLocalizer<AttendanceDeviceRequest> l)
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.OperationType).Must(x => x is "users" or "attendance");
        RuleFor(x => x.Request).NotNull();
        When(x => x.Request is not null, () =>
        {
            RuleFor(x => x.Request).Must(x => ValidRange(x.FromUtc, x.ToUtc)).WithMessage(l["AttendanceDeviceInvalidRange"]);
            RuleFor(x => x.Request.OperationId).NotEqual(Guid.Empty).When(x => x.Request.OperationId.HasValue);
        });
    }
    public static bool ValidRange(DateTime? from, DateTime? to) =>
        (!from.HasValue || from.Value.Kind == DateTimeKind.Utc) &&
        (!to.HasValue || to.Value.Kind == DateTimeKind.Utc) &&
        (!from.HasValue || !to.HasValue || from <= to);
}
public sealed class DetectDeviceValidator : AbstractValidator<DetectAttendanceDeviceCommand>
{
    public DetectDeviceValidator()
    {
        RuleFor(x => x.Request).NotNull();
        When(x => x.Request is not null, () =>
        {
            RuleFor(x => x.Request.Host).Must(x => IPAddress.TryParse(x, out _));
            RuleFor(x => x.Request.Port).InclusiveBetween(1, 65535);
        });
    }
}
public sealed class SubmitAttendanceAgentWorkResultValidator : AbstractValidator<SubmitAttendanceAgentWorkResultCommand>
{
    public SubmitAttendanceAgentWorkResultValidator()
    {
        RuleFor(x => x.AgentId).NotEqual(Guid.Empty);
        RuleFor(x => x.RunId).GreaterThan(0);
        RuleFor(x => x.Result).NotNull();
        When(x => x.Result is not null, () =>
        {
            RuleFor(x => x.Result.ErrorCode).MaximumLength(64);
            RuleFor(x => x.Result.ReadCount).InclusiveBetween(0, 100000);
            RuleFor(x => x.Result.SkippedCount).InclusiveBetween(0, 100000);
            RuleFor(x => x.Result.Users).Must(x => x is null || x.Count <= 20000);
            RuleFor(x => x.Result.Punches).Must(x => x is null || x.Count <= 20000);
            RuleForEach(x => x.Result.Users!).ChildRules(user =>
            {
                user.RuleFor(x => x.ExternalCode).NotEmpty().MaximumLength(128);
                user.RuleFor(x => x.Name).MaximumLength(256);
            }).When(x => x.Result.Users is not null);
            RuleForEach(x => x.Result.Punches!).ChildRules(punch =>
            {
                punch.RuleFor(x => x.ExternalCode).NotEmpty().MaximumLength(128);
                punch.RuleFor(x => x.Name).MaximumLength(256);
                punch.RuleFor(x => x.ProviderEventId).MaximumLength(256);
            }).When(x => x.Result.Punches is not null);
        });
    }
}
public sealed class DevicePageValidator : AbstractValidator<GetAttendanceDevicesQuery>
{
    public DevicePageValidator()
    {
        RuleFor(x => x.PageNumber).InclusiveBetween(1, 1000000);
        RuleFor(x => x.PageSize).Must(AttendancePageValidation.IsAllowedPageSize).WithMessage("Page size must be one of 5, 10, 25, or 50.");
        RuleFor(x => x.Search).MaximumLength(128);
    }
}
public sealed class RawUsersValidator : AbstractValidator<GetRawDeviceUsersQuery>
{
    public RawUsersValidator()
    {
        RuleFor(x => x.Request.PageNumber).InclusiveBetween(1, 1000000);
        RuleFor(x => x.Request.PageSize).Must(AttendancePageValidation.IsAllowedPageSize).WithMessage("Page size must be one of 5, 10, 25, or 50.");
        RuleFor(x => x.Request.Search).MaximumLength(128);
        RuleFor(x => x.Request.DeviceId).GreaterThan(0).When(x => x.Request.DeviceId.HasValue);
        RuleFor(x => x.Request.SortBy).Must(x => x is "externalCode" or "name" or "deviceName" or "pulledAtUtc");
        RuleFor(x => x.Request.SortDirection).Must(x => x is "asc" or "desc");
    }
}
public sealed class RawPunchesValidator : AbstractValidator<GetRawAttendancePunchesQuery>
{
    public RawPunchesValidator()
    {
        RuleFor(x => x.Request.PageNumber).InclusiveBetween(1, 1000000);
        RuleFor(x => x.Request.PageSize).Must(AttendancePageValidation.IsAllowedPageSize).WithMessage("Page size must be one of 5, 10, 25, or 50.");
        RuleFor(x => x.Request.ExternalCode).MaximumLength(128);
        RuleFor(x => x.Request.DeviceId).GreaterThan(0).When(x => x.Request.DeviceId.HasValue);
        RuleFor(x => x.Request).Must(x => StartPullValidator.ValidRange(x.FromUtc, x.ToUtc));
        RuleFor(x => x.Request.SortBy).Must(x => x is "externalCode" or "deviceName" or "occurredAtDeviceLocal" or "occurredAtUtc" or "pulledAtUtc");
        RuleFor(x => x.Request.SortDirection).Must(x => x is "asc" or "desc");
    }
}
public sealed class PullRunsValidator : AbstractValidator<GetDevicePullRunsQuery>
{
    public PullRunsValidator()
    {
        RuleFor(x => x.Request.PageNumber).InclusiveBetween(1, 1000000);
        RuleFor(x => x.Request.PageSize).Must(AttendancePageValidation.IsAllowedPageSize).WithMessage("Page size must be one of 5, 10, 25, or 50.");
        RuleFor(x => x.Request.DeviceId).GreaterThan(0).When(x => x.Request.DeviceId.HasValue);
        RuleFor(x => x.Request.Status).Must(x => x is null or "" or "pending" or "running" or "completed" or "failed");
        RuleFor(x => x.Request.SortBy).Must(x => x is "startedAtUtc" or "finishedAtUtc" or "status" or "operationType");
        RuleFor(x => x.Request.SortDirection).Must(x => x is "asc" or "desc");
    }
}
