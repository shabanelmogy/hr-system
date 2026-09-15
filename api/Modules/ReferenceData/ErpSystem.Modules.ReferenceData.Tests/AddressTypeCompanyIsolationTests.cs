using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.Addresses.Entities;
using ErpSystem.Modules.ReferenceData.Domain.GeographicalInformation.AddressTypes.Entities;
using ErpSystem.Modules.ReferenceData.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.ReferenceData.Tests;

public sealed class AddressTypeCompanyIsolationTests
{
    [Fact]
    public async Task AddressTypes_AreVisibleOnlyInTheActiveCompany()
    {
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
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
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
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
        var options = new DbContextOptionsBuilder<ReferenceDataDbContext>()
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

    private static ReferenceDataDbContext CreateContext(
        DbContextOptions<ReferenceDataDbContext> options,
        string? tenantId,
        int? companyId) =>
        new(options, new TestCurrentActor(tenantId, companyId));

    private sealed class TestCurrentActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; } = companyId;
    }

}

