using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Domain.Platform.Files.Entities;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformScopeIsolationTests
{
    [Fact]
    public async Task PlatformQueries_ReturnOnlyTheCurrentTenantAndCompany()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;

        int firstCompanyId;
        int secondCompanyId;
        await using (var seed = new PlatformDbContext(options))
        {
            var first = new PlatformCompany("tenant-a", "A", "Company A", "شركة أ", "EGP", "Africa/Cairo", DateTime.UtcNow);
            var second = new PlatformCompany("tenant-b", "B", "Company B", "شركة ب", "EGP", "Africa/Cairo", DateTime.UtcNow);
            seed.Companies.AddRange(first, second);
            await seed.SaveChangesAsync();
            firstCompanyId = first.Id;
            secondCompanyId = second.Id;

            seed.CompanyCountries.AddRange(
                new CompanyCountry(1, true) { TenantId = "tenant-a", CompanyId = firstCompanyId },
                new CompanyCountry(2, true) { TenantId = "tenant-b", CompanyId = secondCompanyId });
            await seed.SaveChangesAsync();
        }

        await using var scoped = new PlatformDbContext(options, new TestActor("tenant-a", firstCompanyId, "user-a"));
        Assert.Equal(new[] { firstCompanyId }, await scoped.Companies.Select(company => company.Id).ToArrayAsync());
        Assert.Equal(new[] { 1 }, await scoped.CompanyCountries.Select(link => link.CountryId).ToArrayAsync());
        Assert.Empty(await scoped.CompanyCountries
            .Where(link => link.TenantId == "tenant-b")
            .ToArrayAsync());
        Assert.Equal(2, await scoped.CompanyCountries.IgnoreQueryFilters().CountAsync());
        Assert.NotEqual(firstCompanyId, secondCompanyId);
    }

    [Fact]
    public async Task PlatformCompanyAuditableWrites_StampScopeAndSoftDelete()
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new PlatformDbContext(options, new TestActor("tenant-a", 7, "user-a"));

        var file = new UploadedFile
        {
            FileName = "invoice.pdf",
            StoredFileName = "stored-invoice.pdf",
            ContentType = "application/pdf",
            FileExtension = ".pdf"
        };
        context.Files.Add(file);
        await context.SaveChangesAsync();

        Assert.Equal("tenant-a", file.TenantId);
        Assert.Equal(7, file.CompanyId);
        Assert.Equal("user-a", file.CreatedById);
        Assert.NotEqual(default, file.CreatedOn);

        context.Files.Remove(file);
        await context.SaveChangesAsync();

        Assert.True(file.IsDeleted);
        Assert.Equal("user-a", file.DeletedById);
        Assert.NotNull(file.DeletedOn);
        Assert.Empty(await context.Files.ToArrayAsync());
        Assert.Single(await context.Files.IgnoreQueryFilters().ToArrayAsync());
    }

    private sealed record TestActor(string? TenantId, int? CompanyId, string? UserId) : ICurrentActor;
}
