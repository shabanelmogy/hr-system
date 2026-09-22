using System.Reflection;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Candidates.Queries;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Contracts;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Application.Features.Recruitment.EmploymentApplications.Commands;
using ErpSystem.Modules.HR.Application.Features.Recruitment.Settings;
using ErpSystem.Modules.HR.Domain.Recruitment.Entities;
using ErpSystem.Modules.HR.Domain.Recruitment.Enums;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Candidates.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Dashboard;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.EmploymentApplications.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Shared;
using ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Settings.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using ErpSystem.Modules.HR.Presentation.Features.Recruitment.V1;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.HR.Tests;

public sealed class RecruitmentCqrsFoundationTests
{
    [Fact]
    public void MigratedRecruitmentControllers_AreThinMediatorAdapters()
    {
        AssertSenderOnly(typeof(CandidatesController));
        AssertSenderOnly(typeof(RecruitmentDashboardController));
        AssertSenderOnly(typeof(RecruitmentSettingsController));
        AssertSenderOnly(typeof(JobPostingsController));
        AssertSenderOnly(typeof(JobOpeningsController));
        AssertSenderOnly(typeof(InterviewsController));
        AssertSenderOnly(typeof(EmploymentApplicationsController));
        AssertSenderOnly(typeof(JobOffersController));
        AssertSenderOnly(typeof(JobRequisitionsController));
    }

    [Fact]
    public void RecruitmentMegaService_IsRemovedFromProductionAssemblies()
    {
        Assert.Null(typeof(CreateCandidateCommand).Assembly.GetType(
            "ErpSystem.Modules.HR.Application.Features.Recruitment.Abstractions.IRecruitmentService"));
        Assert.Null(typeof(CandidateRepository).Assembly.GetType(
            "ErpSystem.Modules.HR.Infrastructure.Features.Recruitment.Services.RecruitmentService"));
    }

    [Fact]
    public async Task CandidateCommands_OwnUniquenessMutationAndPersistence()
    {
        var databaseName = Guid.NewGuid().ToString("N");
        var actor = new TestActor("user-a", "tenant-a", 1);
        await using var context = CreateContext(databaseName, actor);
        var readStore = new CandidateReadStore(context);
        var repository = new CandidateRepository(context);
        var createHandler = new CreateCandidateCommandHandler(repository, readStore);

        var mutation = new CandidateMutation(
            "Ada",
            null,
            "Lovelace",
            "ADA@EXAMPLE.COM",
            City: "London");

        var created = await createHandler.Handle(
            new CreateCandidateCommand(mutation),
            CancellationToken.None);

        Assert.True(created.IsSuccess);
        Assert.Equal("ada@example.com", created.Value.Email);
        Assert.Equal("tenant-a", (await context.Candidates.SingleAsync()).TenantId);

        var duplicate = await createHandler.Handle(
            new CreateCandidateCommand(mutation with { FirstName = "Another" }),
            CancellationToken.None);

        Assert.True(duplicate.IsFailure);
        Assert.Equal("Recruitment.CandidateEmailAlreadyExists", duplicate.Error.Code);

        var updateHandler = new UpdateCandidateCommandHandler(repository, readStore);
        var updated = await updateHandler.Handle(
            new UpdateCandidateCommand(created.Value.Id, mutation with { City = "Cairo" }),
            CancellationToken.None);

        Assert.True(updated.IsSuccess);
        Assert.Equal("Cairo", updated.Value.City);
    }

    [Fact]
    public async Task CandidateReadStore_IsTenantIsolated()
    {
        var databaseName = Guid.NewGuid().ToString("N");

        await using (var tenantA = CreateContext(databaseName, new TestActor("user-a", "tenant-a", 1)))
        {
            tenantA.Candidates.Add(new Candidate("A", "Candidate", "a@example.com"));
            await tenantA.SaveChangesAsync();
        }

        await using (var tenantB = CreateContext(databaseName, new TestActor("user-b", "tenant-b", 1)))
        {
            tenantB.Candidates.Add(new Candidate("B", "Candidate", "b@example.com"));
            await tenantB.SaveChangesAsync();
        }

        await using var queryContext = CreateContext(databaseName, new TestActor("user-a", "tenant-a", 1));
        var store = new CandidateReadStore(queryContext);
        var page = await store.GetPageAsync(1, 20, null, CancellationToken.None);

        Assert.Single(page.Items);
        Assert.Equal("a@example.com", page.Items[0].Email);
    }

    [Fact]
    public async Task RecruitmentSettings_HandlerSeedsDefaultsInApplicationAndReadsThemBack()
    {
        var actor = new TestActor("user-a", "tenant-a", 1);
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), actor);
        var repository = new RecruitmentSettingsRepository(context);
        var readStore = new RecruitmentSettingsReadStore(context);
        var handler = new GetRecruitmentSettingsQueryHandler(repository, readStore);

        var settings = await handler.Handle(
            new GetRecruitmentSettingsQuery(),
            CancellationToken.None);

        Assert.NotEmpty(settings.Stages);
        Assert.NotEmpty(settings.RejectionReasons);
        Assert.NotEmpty(settings.Sources);
        Assert.NotEmpty(settings.EvaluationCriteria);
        Assert.Equal("EGP", settings.General.DefaultCurrency);
        Assert.All(await context.RecruitmentStages.ToListAsync(), item => Assert.Equal("tenant-a", item.TenantId));
    }

    [Fact]
    public async Task RecruitmentSettings_UpdateRejectsCurrencyOutsideAccountingCatalog()
    {
        var actor = new TestActor("user-a", "tenant-a", 1);
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), actor);
        var repository = new RecruitmentSettingsRepository(context);
        var readStore = new RecruitmentSettingsReadStore(context);
        var catalog = new TestAccountingCurrencyCatalog("EGP");
        var handler = new UpdateRecruitmentSettingsCommandHandler(repository, readStore, actor, catalog);
        var settings = new RecruitmentSettingsDto
        {
            General = new RecruitmentGeneralSettingsDto { DefaultCurrency = "USD" }
        };

        var result = await handler.Handle(
            new UpdateRecruitmentSettingsCommand(settings),
            CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal("HR.Currency.InvalidOrInactive", result.Error.Code);
        Assert.Empty(await context.RecruitmentPolicies.ToListAsync());
        Assert.Equal("tenant-a", catalog.LastTenantId);
        Assert.Equal(1, catalog.LastCompanyId);
    }

    [Fact]
    public async Task RecruitmentDashboardReadStore_RespectsTenantAndCompanyFilters()
    {
        var databaseName = Guid.NewGuid().ToString("N");

        await using (var companyOne = CreateContext(databaseName, new TestActor("user-1", "tenant-a", 1)))
        {
            companyOne.Candidates.Add(new Candidate("Visible", "Candidate", "visible@example.com"));
            var opening = new JobOpening(
                "JOB-ONE", 1, 1, 1, 1, 1,
                EmploymentType.FullTime,
                WorkArrangement.OnSite);
            opening.Open(DateTimeOffset.UtcNow);
            companyOne.JobOpenings.Add(opening);
            await companyOne.SaveChangesAsync();
        }

        await using (var companyTwo = CreateContext(databaseName, new TestActor("user-2", "tenant-a", 2)))
        {
            var opening = new JobOpening(
                "JOB-TWO", 2, 2, 2, 2, 1,
                EmploymentType.FullTime,
                WorkArrangement.OnSite);
            opening.Open(DateTimeOffset.UtcNow);
            companyTwo.JobOpenings.Add(opening);
            await companyTwo.SaveChangesAsync();
        }

        await using var queryContext = CreateContext(databaseName, new TestActor("user-1", "tenant-a", 1));
        var store = new RecruitmentDashboardReadStore(queryContext);
        var summary = await store.GetSummaryAsync(CancellationToken.None);

        Assert.Equal(1, summary.TotalOpenings);
        Assert.Equal(1, summary.TotalActiveCandidates);
    }

    [Fact]
    public async Task HireCommand_RequiresAcceptedOfferBeforeCreatingEmployee()
    {
        var actor = new TestActor("manager-1", "tenant-a", 1);
        await using var context = CreateContext(Guid.NewGuid().ToString("N"), actor);
        var application = new EmploymentApplication(
            1,
            1,
            ApplicationSource.CareersPortal,
            DateTimeOffset.UtcNow);
        context.EmploymentApplications.Add(application);
        await context.SaveChangesAsync();

        var handler = new HireEmploymentApplicationCommandHandler(
            new RecruitmentHireRepository(context),
            new EmploymentApplicationReadStore(context, CreateRecruitmentMappingConfig()),
            new RecruitmentActorEmployeeSource(context, actor),
            context,
            actor,
            TimeProvider.System);

        var result = await handler.Handle(
            new HireEmploymentApplicationCommand(
                application.Id,
                new HireCandidateMutation("EMP-001", new DateOnly(2026, 9, 13), "hire-1")),
            CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Equal("Recruitment.Hire.AcceptedOfferRequired", result.Error.Code);
        Assert.Empty(await context.Employees.ToListAsync());
        Assert.Equal(ApplicationStatus.Draft, application.Status);
    }

    [Fact]
    public void RecruitmentApplicationMappings_AreDiscoverableAndCompile()
    {
        var config = CreateRecruitmentMappingConfig();

        Assert.NotNull(config.GetMapFunction<JobOpening, JobOpeningDto>());
        Assert.NotNull(config.GetMapFunction<EmploymentApplication, EmploymentApplicationDto>());
        Assert.NotNull(config.GetMapFunction<Interview, InterviewDto>());
        Assert.NotNull(config.GetMapFunction<JobOffer, JobOfferDto>());
        Assert.NotNull(config.GetMapFunction<JobRequisition, JobRequisitionDto>());
    }

    private static void AssertSenderOnly(Type controllerType)
    {
        var constructor = Assert.Single(controllerType.GetConstructors(BindingFlags.Instance | BindingFlags.Public));
        var parameter = Assert.Single(constructor.GetParameters());
        Assert.Equal(typeof(ISender), parameter.ParameterType);
    }

    private static ApplicationDbContext CreateContext(string databaseName, ICurrentActor actor)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName)
            .Options;
        return new ApplicationDbContext(options, actor, TimeProvider.System);
    }

    private static TypeAdapterConfig CreateRecruitmentMappingConfig()
    {
        var config = new TypeAdapterConfig();
        config.Scan(typeof(EmploymentApplicationDto).Assembly);
        return config;
    }

    private sealed record TestActor(string? UserId, string? TenantId, int? CompanyId) : ICurrentActor;
}
