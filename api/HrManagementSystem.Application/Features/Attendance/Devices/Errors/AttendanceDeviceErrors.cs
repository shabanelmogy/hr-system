using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Errors;

public sealed class AttendanceDeviceErrors(IStringLocalizer<AttendanceDeviceRequest> localizer)
{
    public Error NotFound => new("AttendanceDevice.NotFound", localizer["AttendanceDeviceNotFound"], ErrorType.NotFound);
    public Error Duplicate => new("AttendanceDevice.Duplicate", localizer["AttendanceDeviceDuplicate"], ErrorType.Conflict);
    public Error Busy => new("AttendanceDevice.Busy", localizer["AttendanceDeviceBusy"], ErrorType.Conflict);
    public Error Disabled => new("AttendanceDevice.Disabled", localizer["AttendanceDeviceDisabled"], ErrorType.Validation);
    public Error Branch => new("AttendanceDevice.InvalidBranch", localizer["AttendanceDeviceInvalidBranch"], ErrorType.Validation);
    public Error Agent => new("AttendanceDevice.InvalidAgent", localizer["AttendanceDeviceInvalidAgent"], ErrorType.Validation);
    public Error AgentExists => new("AttendanceDevice.AgentExists", localizer["AttendanceDeviceAgentExists"], ErrorType.Conflict);
    public Error Host => new("AttendanceDevice.UntrustedHost", localizer["AttendanceDeviceUntrustedHost"], ErrorType.Validation);
    public Error Scope => new("AttendanceDevice.ScopeRequired", localizer["AttendanceDeviceScopeRequired"], ErrorType.Validation);
    public Error Credential => new("AttendanceDevice.CredentialUnavailable", localizer["AttendanceDeviceCredentialUnavailable"], ErrorType.Validation);
    public Error Provider => new("AttendanceDevice.ProviderUnavailable", localizer["AttendanceDeviceProviderUnavailable"], ErrorType.Validation);
    public Error OperationConflict => new("AttendanceDevice.OperationConflict", localizer["AttendanceDeviceOperationConflict"], ErrorType.Conflict);
    public Error AgentLease => new("AttendanceDevice.AgentLease", localizer["AttendanceDeviceAgentLease"], ErrorType.Conflict);
}
