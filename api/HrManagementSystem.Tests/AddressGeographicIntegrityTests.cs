using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Contracts;
using HrManagementSystem.Application.Features.GeographicalInformation.Addresses.Errors;
using HrManagementSystem.Domain.GeographicalInformation.Addresses.Entities;
using HrManagementSystem.Domain.GeographicalInformation.AddressTypes.Entities;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.GeographicalInformation.States.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Addresses.Services;
using HrManagementSystem.Infrastructure.Features.Platform.EntityChangeLogs.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Mapster;
using MapsterMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class AddressGeographicIntegrityTests
{
    [Fact]
    public async Task Add_RejectsCountryOutsideTheActiveCompanyOperatingScope()
    {
        await using var fixture = await AddressFixture.CreateAsync();
        var outsideCountry = await fixture.AddCountryAsync("Saudi Arabia", "السعودية");

        var result = await fixture.Service.AddAsync(fixture.CreateRequest(outsideCountry.Id));

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.Empty(fixture.Context.Addresses);
    }

    [Fact]
    public async Task Update_RejectsCountryOutsideTheActiveCompanyOperatingScope()
    {
        await using var fixture = await AddressFixture.CreateAsync();
        var activeAddress = await fixture.AddAddressAsync(fixture.OperatingCountry.Id);
        var outsideCountry = await fixture.AddCountryAsync("Saudi Arabia", "السعودية");

        var result = await fixture.Service.UpdateAsync(fixture.CreateRequest(outsideCountry.Id, activeAddress.Id));

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.Equal(fixture.OperatingCountry.Id, activeAddress.CountryId);
    }

    [Fact]
    public async Task Restore_RejectsAddressWhenItsCountryWasRemovedFromOperatingScope()
    {
        await using var fixture = await AddressFixture.CreateAsync();
        var archivedAddress = await fixture.AddAddressAsync(fixture.OperatingCountry.Id, isDeleted: true);
        var scopeLink = await fixture.Context.CompanyCountries.SingleAsync();
        scopeLink.IsDeleted = true;
        await fixture.Context.SaveChangesAsync();

        var result = await fixture.Service.ToggleAsync(archivedAddress.Id);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.CountryOutsideOperatingScope", result.Error.Code);
        Assert.True(archivedAddress.IsDeleted);
    }

    [Fact]
    public async Task Restore_RejectsAddressWhenItsStateWasArchived()
    {
        await using var fixture = await AddressFixture.CreateAsync();
        var state = await fixture.AddStateAsync(fixture.OperatingCountry.Id);
        var archivedAddress = await fixture.AddAddressAsync(
            fixture.OperatingCountry.Id,
            stateId: state.Id,
            isDeleted: true);
        state.IsDeleted = true;
        await fixture.Context.SaveChangesAsync();

        var result = await fixture.Service.ToggleAsync(archivedAddress.Id);

        Assert.True(result.IsFailure);
        Assert.Equal("Address.InvalidState", result.Error.Code);
        Assert.True(archivedAddress.IsDeleted);
    }

    private sealed class AddressFixture : IAsyncDisposable
    {
        private const string TenantId = "tenant-1";
        private const int CompanyId = 11;

        private AddressFixture(ApplicationDbContext context, TestCurrentActor actor, Country operatingCountry, AddressType addressType)
        {
            Context = context;
            OperatingCountry = operatingCountry;
            AddressType = addressType;
            Service = new AddressService(
                context,
                actor,
                new EntityChangeLogService(context, actor, TimeProvider.System),
                new AddressErrors(new EchoLocalizer<AddressRequest>()),
                new Mapper(new TypeAdapterConfig()));
        }

        public ApplicationDbContext Context { get; }
        public Country OperatingCountry { get; }
        public AddressType AddressType { get; }
        public AddressService Service { get; }

        public static async Task<AddressFixture> CreateAsync()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
                .Options;
            var actor = new TestCurrentActor();
            var context = new ApplicationDbContext(options, actor, TimeProvider.System);
            var country = new Country { NameAr = "مصر", NameEn = "Egypt", Alpha2Code = "EG" };
            var addressType = new AddressType
            {
                TenantId = TenantId,
                CompanyId = CompanyId,
                NameAr = "العمل",
                NameEn = "Work"
            };
            context.Countries.Add(country);
            context.AddressTypes.Add(addressType);
            await context.SaveChangesAsync();
            context.CompanyCountries.Add(new CompanyCountry(country.Id, isDefault: true)
            {
                TenantId = TenantId,
                CompanyId = CompanyId
            });
            await context.SaveChangesAsync();

            return new AddressFixture(context, actor, country, addressType);
        }

        public async Task<Country> AddCountryAsync(string nameEn, string nameAr)
        {
            var country = new Country { NameEn = nameEn, NameAr = nameAr };
            Context.Countries.Add(country);
            await Context.SaveChangesAsync();
            return country;
        }

        public async Task<State> AddStateAsync(int countryId)
        {
            var state = new State
            {
                CountryId = countryId,
                NameAr = "القاهرة",
                NameEn = "Cairo",
                Code = "C"
            };
            Context.States.Add(state);
            await Context.SaveChangesAsync();
            return state;
        }

        public async Task<Address> AddAddressAsync(
            int countryId,
            int? stateId = null,
            bool isDeleted = false)
        {
            var address = new Address
            {
                TenantId = TenantId,
                CompanyId = CompanyId,
                CountryId = countryId,
                StateId = stateId,
                AddressTypeId = AddressType.Id,
                City = "Cairo",
                StreetLine1 = "10 Tahrir Street",
                IsDeleted = isDeleted
            };
            Context.Addresses.Add(address);
            await Context.SaveChangesAsync();
            return address;
        }

        public AddressRequest CreateRequest(int countryId, int id = 0) => new(
            id,
            countryId,
            null,
            null,
            "Cairo",
            "10 Tahrir Street",
            null,
            "10",
            null,
            null,
            null,
            null,
            null,
            null,
            AddressType.Id);

        public ValueTask DisposeAsync() => Context.DisposeAsync();
    }

    private sealed class TestCurrentActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name, true);
        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), true);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
