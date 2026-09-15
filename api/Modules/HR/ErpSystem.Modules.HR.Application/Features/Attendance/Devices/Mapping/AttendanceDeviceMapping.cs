using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;
using ErpSystem.Modules.HR.Domain.Attendance.Devices.Entities;
using Mapster;

namespace ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Mapping;

public sealed class AttendanceDeviceMapping : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AttendanceDeviceRequest, AttendanceDevice>()
            .Map(d => d.Name, s => s.Name.Trim())
            .Map(d => d.NormalizedName, s => s.Name.Trim().ToUpperInvariant())
            .Map(d => d.Host, s => s.Host.Trim())
            .Map(d => d.ProviderId, s => s.ProviderId.Trim().ToLowerInvariant());
        config.NewConfig<UpdateAttendanceDeviceRequest, AttendanceDevice>()
            .Ignore(d => d.RowVersion)
            .Map(d => d.Name, s => s.Name.Trim())
            .Map(d => d.NormalizedName, s => s.Name.Trim().ToUpperInvariant())
            .Map(d => d.Host, s => s.Host.Trim())
            .Map(d => d.ProviderId, s => s.ProviderId.Trim().ToLowerInvariant());
        config.NewConfig<AttendanceDevice, AttendanceDeviceResponse>()
            .Map(d => d.HasCredentials, s => s.Credential != null);
        config.NewConfig<DevicePullRun, PullRunResponse>()
            .Map(d => d.DeviceId, s => s.AttendanceDeviceId)
            .Map(d => d.Error, s => s.SafeError);
        config.NewConfig<RawDeviceUser, RawDeviceUserResponse>()
            .Map(d => d.DeviceId, s => s.AttendanceDeviceId)
            .Map(d => d.DeviceName, s => s.AttendanceDevice.Name);
        config.NewConfig<RawAttendancePunch, RawAttendancePunchResponse>()
            .Map(d => d.DeviceId, s => s.AttendanceDeviceId)
            .Map(d => d.DeviceName, s => s.AttendanceDevice.Name);
    }
}
