using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Domain.Common.Abstractions;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Infrastructure.Features.Platform.EntityChangeLogs.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class AddressTypeCompanyIsolationTests
{
    [Fact]
    public async Task AddressTypes_AreVisibleOnlyInTheActiveCompany()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        int firstCompanyAddressTypeId;
        await using (var firstCompany = CreateContext(options, "tenant-1", 11))
        {
            var addressType = new AddressType
            {
                TenantId = "tenant-1",
                CompanyId = 11,
                NameAr = "سكن",
                NameEn = "Residence"
            };
            firstCompany.AddressTypes.Add(addressType);
            await firstCompany.SaveChangesAsync();
            firstCompanyAddressTypeId = addressType.Id;
        }

        await using (var secondCompany = CreateContext(options, "tenant-1", 22))
        {
            secondCompany.AddressTypes.Add(new AddressType
            {
                TenantId = "tenant-1",
                CompanyId = 22,
                NameAr = "سكن",
                NameEn = "Residence"
            });
            await secondCompany.SaveChangesAsync();

            var visible = await secondCompany.AddressTypes.AsNoTracking().SingleAsync();
            Assert.Equal(22, visible.CompanyId);
            Assert.NotEqual(firstCompanyAddressTypeId, visible.Id);
            Assert.Null(await secondCompany.AddressTypes.AsNoTracking()
                .SingleOrDefaultAsync(item => item.Id == firstCompanyAddressTypeId));
        }

        await using var firstCompanyAgain = CreateContext(options, "tenant-1", 11);
        var firstVisible = await firstCompanyAgain.AddressTypes.AsNoTracking().SingleAsync();
        Assert.Equal(firstCompanyAddressTypeId, firstVisible.Id);
        Assert.Equal(11, firstVisible.CompanyId);
    }

    [Fact]
    public async Task AddressTypes_FailClosedWithoutAnActiveCompany()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using (var companyContext = CreateContext(options, "tenant-1", 11))
        {
            companyContext.AddressTypes.Add(new AddressType
            {
                TenantId = "tenant-1",
                CompanyId = 11,
                NameAr = "عمل",
                NameEn = "Work"
            });
            await companyContext.SaveChangesAsync();
        }

        await using var noCompanyContext = CreateContext(options, "tenant-1", null);
        Assert.Empty(await noCompanyContext.AddressTypes.AsNoTracking().ToListAsync());
    }

    [Fact]
    public void Model_UsesCompanyScopedUniqueNamesAndCompositeAddressForeignKey()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = CreateContext(options, "tenant-1", 11);

        Assert.IsAssignableFrom<ICompanyScoped>(new AddressType());

        var addressTypeEntity = context.Model.FindEntityType(typeof(AddressType))!;
        var uniqueIndexes = addressTypeEntity.GetIndexes()
            .Where(index => index.IsUnique)
            .Select(index => index.Properties.Select(property => property.Name).ToArray())
            .ToArray();
        Assert.Contains(uniqueIndexes, properties =>
            properties.SequenceEqual(["TenantId", "CompanyId", "NameAr"]));
        Assert.Contains(uniqueIndexes, properties =>
            properties.SequenceEqual(["TenantId", "CompanyId", "NameEn"]));

        var addressEntity = context.Model.FindEntityType(typeof(Address))!;
        var addressTypeForeignKey = Assert.Single(
            addressEntity.GetForeignKeys(),
            foreignKey => foreignKey.PrincipalEntityType.ClrType == typeof(AddressType));
        Assert.Equal(
            ["TenantId", "CompanyId", "AddressTypeId"],
            addressTypeForeignKey.Properties.Select(property => property.Name));
        Assert.Equal(
            ["TenantId", "CompanyId", "Id"],
            addressTypeForeignKey.PrincipalKey.Properties.Select(property => property.Name));
    }

    [Fact]
    public async Task AddressWrites_RejectAnArchivedAddressTypeInsideTheAtomicOperation()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        var actor = new TestCurrentActor("tenant-1", 11);
        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);
        var addressType = new AddressType
        {
            TenantId = "tenant-1",
            CompanyId = 11,
            NameAr = "Residence AR",
            NameEn = "Residence",
            IsDeleted = true
        };
        context.AddressTypes.Add(addressType);
        await context.SaveChangesAsync();

        var service = new AddressService(
            context,
            actor,
            new EntityChangeLogService(context, actor, TimeProvider.System),
            new AddressErrors(new EchoLocalizer<AddressRequest>()),
            new Mapper(new TypeAdapterConfig()));

        var result = await service.AddAsync(new AddressRequest(
            0,
            "10",
            "2",
            "5",
            "12345",
            string.Empty,
            30,
            31,
            false,
            addressType.Id,
            1));

        Assert.True(result.IsFailure);
        Assert.Equal("Address.InvalidAddressType", result.Error.Code);
        Assert.Empty(context.Addresses);
    }

    private static ApplicationDbContext CreateContext(
        DbContextOptions<ApplicationDbContext> options,
        string? tenantId,
        int? companyId) =>
        new(options, new TestCurrentActor(tenantId, companyId), TimeProvider.System);

    private sealed class TestCurrentActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), true);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
