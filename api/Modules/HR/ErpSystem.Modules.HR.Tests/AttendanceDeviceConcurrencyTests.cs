using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Mapping;
using ErpSystem.Modules.HR.Domain.Attendance.Devices.Entities;
using ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Tests;

public sealed class AttendanceDeviceConcurrencyTests
{
    [Fact]
    public void ApplyRowVersion_UsesClientTokenAndForcesDeviceUpdate()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = new ApplicationDbContext(options, new TestActor(), TimeProvider.System);
        var device = new AttendanceDevice
        {
            Id = 7,
            Name = "Clock",
            NormalizedName = "CLOCK",
            ProviderId = "zkteco-com",
            Host = "10.0.0.5",
            Port = 4370,
            TimeZoneId = "UTC",
            TenantId = "tenant-1",
            CompanyId = 11,
            CreatedById = "admin",
            RowVersion = [1, 2, 3, 4]
        };
        context.Attach(device);
        context.Entry(device).State = EntityState.Unchanged;
        var config = new TypeAdapterConfig();
        new AttendanceDeviceMapping().Register(config);
        var store = new AttendanceDeviceStore(context, new Mapper(config));
        var supplied = new byte[] { 9, 8, 7, 6 };

        store.ApplyRowVersion(device, Convert.ToBase64String(supplied));

        var entry = context.Entry(device);
        Assert.Equal(supplied, entry.Property(item => item.RowVersion).OriginalValue);
        Assert.True(entry.Property(item => item.UpdatedOn).IsModified);
    }

    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
    }
}
