using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Abstractions;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Commands;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.FiscalYears.Errors;
using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Enums;
using ErpSystem.Modules.Accounting.Infrastructure;
using ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Localization;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class AccountingUnitOfWorkRegistrationTests
{
    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task FiscalYearCreate_UsesAccountingUnitOfWork_WhenSharedRegistrationCompetes(bool registerSharedAfterAccounting)
    {
        var databaseName = $"accounting-uow-{Guid.NewGuid():N}";
        var actor = new TestActor("tenant-1", 11);
        var services = new ServiceCollection();
        services.AddSingleton<ICurrentActor>(actor);

        if (!registerSharedAfterAccounting)
            services.AddScoped<IUnitOfWork, CompetingUnitOfWork>();

        services.AddAccountingInfrastructure(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Accounting"] =
                    "Server=(local);Database=AccountingUnitOfWorkTests;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build());

        // Keep the production feature registrations while replacing only the
        // context instance with an isolated provider for this composition test.
        services.RemoveAll<AccountingDbContext>();
        services.AddScoped(_ => new AccountingDbContext(
            new DbContextOptionsBuilder<AccountingDbContext>()
                .UseInMemoryDatabase(databaseName)
                .Options,
            actor,
            TimeProvider.System));
        services.AddScoped<CreateFiscalYearCommandHandler>();
        services.AddScoped<FiscalYearErrors>();
        services.AddSingleton<IStringLocalizer<CreateFiscalYearRequest>, EchoLocalizer>();
        services.AddScoped<RecordingScheduler>();
        services.AddScoped<IFiscalYearChangeScheduler>(provider =>
            provider.GetRequiredService<RecordingScheduler>());

        if (registerSharedAfterAccounting)
            services.AddScoped<IUnitOfWork, CompetingUnitOfWork>();

        await using var provider = services.BuildServiceProvider();
        await using var scope = provider.CreateAsyncScope();
        var handler = scope.ServiceProvider.GetRequiredService<CreateFiscalYearCommandHandler>();

        var result = await handler.Handle(new CreateFiscalYearCommand(
            "FY-2027", "السنة المالية 2027", "Fiscal Year 2027",
            new DateOnly(2027, 1, 1), new DateOnly(2027, 12, 31),
            FiscalPeriodFrequency.Monthly), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var context = scope.ServiceProvider.GetRequiredService<AccountingDbContext>();
        Assert.Same(context, scope.ServiceProvider.GetRequiredService<IAccountingUnitOfWork>());
        Assert.IsType<CompetingUnitOfWork>(scope.ServiceProvider.GetRequiredService<IUnitOfWork>());
        Assert.Equal(1, await context.FiscalYears.CountAsync());
        Assert.Equal(12, await context.FiscalPeriods.CountAsync());
        Assert.Equal("FY-2027", (await context.FiscalYears.SingleAsync()).Code);
        Assert.NotNull(scope.ServiceProvider.GetRequiredService<RecordingScheduler>().Change);
    }

    private sealed record TestActor(string? TenantId, int? CompanyId) : ICurrentActor
    {
        public string? UserId => "accounting-test-user";
    }

    private sealed class CompetingUnitOfWork : IUnitOfWork
    {
        public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("The shared unit of work must not be used by Accounting.");

        public Task<TResult> ExecuteAtomicallyAsync<TResult>(
            IReadOnlyCollection<string> lockResources,
            Func<CancellationToken, Task<TResult>> operation,
            CancellationToken cancellationToken = default) =>
            throw new InvalidOperationException("The shared unit of work must not be used by Accounting.");
    }

    private sealed class RecordingScheduler : IFiscalYearChangeScheduler
    {
        public FiscalYearChange? Change { get; private set; }

        public void Schedule(FiscalYearChange change) => Change = change;
    }

    private sealed class EchoLocalizer : IStringLocalizer<CreateFiscalYearRequest>
    {
        public LocalizedString this[string name] => new(name, name, true);

        public LocalizedString this[string name, params object[] arguments] =>
            new(name, string.Format(name, arguments), true);

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures) => [];
    }
}
