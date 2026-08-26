using System.Reflection;
using HrManagementSystem.Api.Features.Attendance.Devices.V1;
using HrManagementSystem.Application.Abstractions.Messaging;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Features.Attendance.Devices.Commands;
using HrManagementSystem.Application.Features.Attendance.Devices.Contracts;
using HrManagementSystem.Application.Features.Attendance.Devices.Mapping;
using HrManagementSystem.Application.Features.Attendance.Devices.Queries;
using HrManagementSystem.Infrastructure.Features.Attendance.Devices.Persistence;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using Mapster;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace HrManagementSystem.Tests;

public sealed class AttendanceDevicesArchitectureTests
{
    [Fact]
    public void Controllers_AreThinAndUseSenderOnly()
    {
        Assert.Equal([typeof(ISender)], Assert.Single(typeof(AttendanceDevicesController).GetConstructors())
            .GetParameters().Select(x => x.ParameterType));
        Assert.Equal([typeof(ISender)], Assert.Single(typeof(AttendanceDeviceRawController).GetConstructors())
            .GetParameters().Select(x => x.ParameterType));
    }

    [Fact]
    public void DeviceController_UsesVersionedPermissionProtectedSurface()
    {
        AssertRoute<HttpGetAttribute>(nameof(AttendanceDevicesController.Get), null);
        AssertRoute<HttpPostAttribute>(nameof(AttendanceDevicesController.Create), null);
        AssertRoute<HttpPutAttribute>(nameof(AttendanceDevicesController.Update), "{id:int}");
        AssertRoute<HttpPatchAttribute>(nameof(AttendanceDevicesController.SetEnabled), "{id:int}/enabled");
        AssertRoute<HttpPutAttribute>(nameof(AttendanceDevicesController.UpdateCredentials), "{id:int}/credentials");
        AssertRoute<HttpGetAttribute>(nameof(AttendanceDevicesController.Providers), "providers");
        AssertRoute<HttpGetAttribute>(nameof(AttendanceDevicesController.Branches), "branches");
        AssertRoute<HttpPostAttribute>(nameof(AttendanceDevicesController.PullAttendance), "{id:int}/pull-attendance");
        Assert.Equal(Permissions.ManageAttendanceDeviceCredentials,
            typeof(AttendanceDevicesController).GetMethod(nameof(AttendanceDevicesController.UpdateCredentials))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
        Assert.Equal(Permissions.PullAttendanceDevices,
            typeof(AttendanceDevicesController).GetMethod(nameof(AttendanceDevicesController.PullAttendance))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    [Fact]
    public void ApplicationContract_DoesNotAcceptSecretsInReadResponses()
    {
        var sensitive = new[] { "Password", "CommKey", "Token", "ProtectedPayload" };
        foreach (var response in new[] { typeof(AttendanceDeviceResponse), typeof(DeviceTestResponse), typeof(PullRunResponse) })
            Assert.DoesNotContain(response.GetProperties(), property => sensitive.Contains(property.Name));
        Assert.Equal("Attendance device credentials [REDACTED]",
            new UpdateDeviceCredentialsRequest(null, "1234", null).ToString());
    }

    [Fact]
    public void Branch_IsAUserSelectedSameCompanyAssociation_NotATokenClaim()
    {
        Assert.Contains(typeof(AttendanceDeviceRequest).GetProperties(), x => x.Name == "BranchId");
        Assert.DoesNotContain(typeof(AttendanceDeviceRequest).GetProperties(), x => x.Name.Contains("Tenant", StringComparison.Ordinal));
        Assert.DoesNotContain(typeof(AttendanceDeviceRequest).GetProperties(), x => x.Name.Contains("Company", StringComparison.Ordinal));
    }

    [Fact]
    public void CommandsAndQueries_UseProjectMessagingContracts()
    {
        Assert.IsAssignableFrom<ICommand<Result<AttendanceDeviceResponse>>>(
            new CreateAttendanceDeviceCommand(new("Device", "zkteco-com", "192.168.1.10", 4370, "UTC")));
        Assert.IsAssignableFrom<ICommand<Result<PullRunResponse>>>(
            new StartAttendanceDevicePullCommand(1, "attendance", new(null, null, null)));
        Assert.IsAssignableFrom<IQuery<IReadOnlyList<AttendanceBranchResponse>>>(new GetAttendanceBranchesQuery());
    }

    [Fact]
    public void Mapping_HasOnlyFeatureOwnedNonConventionalRules()
    {
        var config = new TypeAdapterConfig();
        new AttendanceDeviceMapping().Register(config);
        Assert.NotNull(config.GetMapFunction<AttendanceDeviceRequest,
            HrManagementSystem.Domain.Attendance.Devices.Entities.AttendanceDevice>());
    }

    [Fact]
    public void LegacyMonolithicDeviceService_IsNotPresent()
    {
        Assert.Null(typeof(AttendanceDeviceStore).Assembly.GetType(
            "HrManagementSystem.Infrastructure.Features.Attendance.Devices.Services.AttendanceDeviceService"));
    }

    private static void AssertRoute<TAttribute>(string action, string? expected) where TAttribute : HttpMethodAttribute
    {
        var method = typeof(AttendanceDevicesController).GetMethod(action)!;
        Assert.Equal(expected, Assert.Single(method.GetCustomAttributes(typeof(TAttribute), false).Cast<TAttribute>()).Template);
    }
}
