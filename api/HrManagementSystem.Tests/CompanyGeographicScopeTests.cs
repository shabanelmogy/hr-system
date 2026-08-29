using System.Reflection;
using System.Runtime.CompilerServices;
using FluentValidation;
using HrManagementSystem.Api.Features.OrganizationalStructure.CompanyGeographicScope.V1;
using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Common.Errors;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Commands;
using HrManagementSystem.Application.Features.OrganizationalStructure.CompanyGeographicScope.Contracts;
using HrManagementSystem.Domain.GeographicalInformation.Countries.Entities;
using HrManagementSystem.Domain.OrganizationalStructure.Entities;
using HrManagementSystem.Infrastructure.Features.OrganizationalStructure.CompanyGeographicScope.Persistence;
using HrManagementSystem.Infrastructure.Features.GeographicalInformation.Countries.Persistence;
using HrManagementSystem.Infrastructure.Migrations;
using HrManagementSystem.Infrastructure.Persistence;
using HrManagementSystem.Infrastructure.Security.Authorization.Filters;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.Extensions.Localization;

namespace HrManagementSystem.Tests;

public sealed class CompanyGeographicScopeTests
{
    [Fact]
    public async Task Validator_RejectsRegistrationCountryOutsideOperatingScope()
    {
        var validator = new UpdateCompanyGeographicScopeCommandValidator(
            new EchoLocalizer<UpdateCompanyGeographicScopeRequest>());

        var result = await validator.ValidateAsync(
            new UpdateCompanyGeographicScopeCommand([10, 20], 10, 30));

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, failure =>
            failure.PropertyName == nameof(UpdateCompanyGeographicScopeCommand.RegistrationCountryId) &&
            failure.ErrorMessage == "CompanyRegistrationCountryMustBeSelected");
    }

    [Fact]
    public async Task Controller_ForwardsRegistrationCountryInTheExistingPutContract()
    {
        var sender = new RecordingSender();
        var controller = new CompanyGeographicScopeController(sender);
        var request = new UpdateCompanyGeographicScopeRequest([10, 20], 10, 20);

        var action = await controller.Update(request, CancellationToken.None);

        Assert.IsType<OkObjectResult>(action);
        var command = Assert.IsType<UpdateCompanyGeographicScopeCommand>(
            Assert.Single(sender.Requests));
        Assert.Equal(20, command.RegistrationCountryId);
        Assert.Equal(typeof(int?), typeof(CompanyGeographicScopeResponse)
            .GetProperty(nameof(CompanyGeographicScopeResponse.RegistrationCountryId))!
            .PropertyType);
        Assert.NotNull(typeof(CompanyCountryOptionResponse)
            .GetProperty(nameof(CompanyCountryOptionResponse.IsRegistrationCountry)));

        Assert.Equal(
            "CompanyGeographicScope:Manage",
            typeof(CompanyGeographicScopeController)
                .GetMethod(nameof(CompanyGeographicScopeController.Update))!
                .GetCustomAttribute<HasPermissionAttribute>()?.Policy);
    }

    [Fact]
    public async Task Store_ProjectsAndPersistsRegistrationCountrySeparatelyFromDefault()
    {
        var actor = new TestCurrentActor("tenant-1", 1);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);

        context.Countries.AddRange(
            new Country { Id = 10, NameAr = "مصر", NameEn = "Egypt" },
            new Country { Id = 20, NameAr = "الإمارات", NameEn = "United Arab Emirates" });
        var company = new Company("COMP", "Company", "شركة", "USD", "UTC")
        {
            TenantId = "tenant-1"
        };
        context.Companies.Add(company);
        await context.SaveChangesAsync();

        actor.CompanyId = company.Id;
        var store = new CompanyGeographicScopeStore(context, actor);
        await store.ReplaceAsync(company.Id, [10, 20], 10, 20, CancellationToken.None);
        await context.SaveChangesAsync();

        var response = await store.GetAsync(company.Id, CancellationToken.None);

        Assert.Equal(10, response.DefaultCountryId);
        Assert.Equal(20, response.RegistrationCountryId);
        Assert.True(Assert.Single(response.Countries, item => item.Id == 10).IsDefault);
        Assert.False(Assert.Single(response.Countries, item => item.Id == 10).IsRegistrationCountry);
        Assert.True(Assert.Single(response.Countries, item => item.Id == 20).IsRegistrationCountry);
        Assert.False(Assert.Single(response.Countries, item => item.Id == 20).IsDefault);
        Assert.Equal(20, (await context.Companies.SingleAsync()).RegistrationCountryId);

        var countryWriteStore = new CountryWriteStore(context);
        Assert.True(await countryWriteStore.HasCompanyUsageAsync(10, CancellationToken.None));
        Assert.True(await countryWriteStore.HasCompanyUsageAsync(20, CancellationToken.None));
    }

    [Fact]
    public void ModelAndMigration_UseRestrictiveCountryReferenceAndSafeBackfill()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;
        using var context = new ApplicationDbContext(
            options,
            new TestCurrentActor("tenant-1", 1),
            TimeProvider.System);

        var companyEntity = context.Model.FindEntityType(typeof(Company))!;
        var foreignKey = Assert.Single(companyEntity.GetForeignKeys(), item =>
            item.PrincipalEntityType.ClrType == typeof(Country) &&
            item.Properties.Single().Name == nameof(Company.RegistrationCountryId));
        Assert.Equal(DeleteBehavior.Restrict, foreignKey.DeleteBehavior);
        Assert.Contains(companyEntity.GetIndexes(), index =>
            index.Properties.Select(property => property.Name)
                .SequenceEqual([nameof(Company.RegistrationCountryId)]));

        var migration = new AddCompanyRegistrationCountry();
        var sql = Assert.Single(migration.UpOperations.OfType<SqlOperation>()).Sql;
        Assert.Contains("companyCountry.IsDefault = 1", sql, StringComparison.Ordinal);
        Assert.Contains("companyCountry.IsDeleted = 0", sql, StringComparison.Ordinal);
        Assert.Contains("company.RegistrationCountryId IS NULL", sql, StringComparison.Ordinal);
        var migrationForeignKey = Assert.Single(
            migration.UpOperations.OfType<AddForeignKeyOperation>());
        Assert.Equal(ReferentialAction.Restrict, migrationForeignKey.OnDelete);
    }

    private sealed class TestCurrentActor(string? tenantId, int? companyId) : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId { get; } = tenantId;
        public int? CompanyId { get; set; } = companyId;
    }

    private sealed class EchoLocalizer<T> : IStringLocalizer<T>
    {
        public LocalizedString this[string name] => new(name, name);
        public LocalizedString this[string name, params object[] arguments] => new(name, name);
        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }

    private sealed class RecordingSender : ISender
    {
        public List<object> Requests { get; } = [];

        public Task<TResponse> Send<TResponse>(
            IRequest<TResponse> request,
            CancellationToken cancellationToken = default)
        {
            Requests.Add(request);
            object response = request switch
            {
                UpdateCompanyGeographicScopeCommand command => Result.Success(
                    new CompanyGeographicScopeResponse(
                        1,
                        command.DefaultCountryId,
                        command.RegistrationCountryId,
                        [])),
                _ => throw new NotSupportedException(request.GetType().FullName)
            };

            return Task.FromResult((TResponse)response);
        }

        public Task Send<TRequest>(
            TRequest request,
            CancellationToken cancellationToken = default)
            where TRequest : IRequest =>
            throw new NotSupportedException();

        public Task<object?> Send(
            object request,
            CancellationToken cancellationToken = default) =>
            throw new NotSupportedException();

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(
            IStreamRequest<TResponse> request,
            CancellationToken cancellationToken = default) =>
            Empty<TResponse>(cancellationToken);

        public IAsyncEnumerable<object?> CreateStream(
            object request,
            CancellationToken cancellationToken = default) =>
            Empty<object?>(cancellationToken);

        private static async IAsyncEnumerable<T> Empty<T>(
            [EnumeratorCancellation] CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            cancellationToken.ThrowIfCancellationRequested();
            yield break;
        }
    }
}
