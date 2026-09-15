using ErpSystem.Modules.HR.Infrastructure.Dependencies;
using ErpSystem.Modules.Platform.Infrastructure.Mapping;
using ErpSystem.Modules.ReferenceData.Infrastructure.Mapping;
using Mapster;
using MapsterMapper;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class MapsterMappingFoundationTests
{
    [Fact]
    public void ModuleMappingRegistration_SharesOneConfigAndOneMapper()
    {
        var services = new ServiceCollection();

        services.AddMapsterService();
        services.AddReferenceDataMapster();
        services.AddPlatformMapster();

        Assert.Single(services, descriptor => descriptor.ServiceType == typeof(TypeAdapterConfig));
        Assert.Single(services, descriptor => descriptor.ServiceType == typeof(IMapper));

        using var provider = services.BuildServiceProvider();
        var config = provider.GetRequiredService<TypeAdapterConfig>();
        var mapper = provider.GetRequiredService<IMapper>();

        Assert.Same(TypeAdapterConfig.GlobalSettings, config);
        Assert.Same(config, mapper.Config);
        Assert.NotNull(config.GetMapFunction<
            ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts.AttendanceDeviceRequest,
            ErpSystem.Modules.HR.Domain.Attendance.Devices.Entities.AttendanceDevice>());
        Assert.NotNull(config.GetMapFunction<
            ErpSystem.Modules.ReferenceData.Application.Features.GeographicalInformation.Countries.Contracts.CountryMutation,
            ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Countries.Entities.Country>());
        Assert.NotNull(config.GetMapFunction<
            ErpSystem.Modules.Platform.Infrastructure.Features.Platform.Notifications.Entities.Notification,
            ErpSystem.Modules.Platform.Application.Features.Platform.Notifications.Contracts.NotificationResponse>());
    }
}
