using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Domain.Attendance.Devices.Entities;
using Mapster;

namespace HrManagementSystem.Application.Features.Attendance.Devices.Mapping;

public sealed class AttendanceDeviceMapping : IRegister
{
    public void Register(TypeAdapterConfig config)
    {
        config.NewConfig<AttendanceDeviceRequest, AttendanceDevice>()
            .Map(d => d.Name, s => s.Name.Trim())
            .Map(d => d.NormalizedName, s => s.Name.Trim().ToUpperInvariant())
            .Map(d => d.Host, s => s.Host.Trim())
            .Map(d => d.ProviderId, s => s.ProviderId.Trim().ToLowerInvariant());
        config.NewConfig<AttendanceDevice, AttendanceDeviceResponse>()
            .Map(d => d.HasCredentials, s => s.Credential != null)
            .Map(d => d.AttendanceAgentName, s => s.AttendanceAgent == null ? null : s.AttendanceAgent.Name)
            .Map(d => d.BranchNameEn, s => s.Branch == null ? null : s.Branch.NameEn)
            .Map(d => d.BranchNameAr, s => s.Branch == null ? null : s.Branch.NameAr);
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
