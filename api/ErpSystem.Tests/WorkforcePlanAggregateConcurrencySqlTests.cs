using ErpSystem.Modules.HR.Application.Abstractions.Authentication;
using ErpSystem.Modules.HR.Infrastructure.Features.WorkforcePlanning.Persistence;
using ErpSystem.Modules.HR.Infrastructure.Persistence;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Tests;

public sealed class WorkforcePlanAggregateConcurrencySqlTests
{
    [Fact]
    public async Task ChildOnlyAggregateUpdate_AdvancesParentRowVersion_AndRejectsStaleOverwrite()
    {
        var databaseName = $"WorkforcePlanConcurrency_{Guid.NewGuid():N}";
        var connectionString =
            $"Server=(localdb)\\mssqllocaldb;Database={databaseName};Trusted_Connection=True;TrustServerCertificate=True";

        await CreateDatabaseAsync(databaseName);

        try
        {
            await using (var setup = CreateContext(connectionString))
            {
                await CreateWorkforceTablesAsync(setup);
                await SeedPlanAsync(setup);
            }

            await using var first = CreateContext(connectionString);
            await using var stale = CreateContext(connectionString);
            var firstStore = new WorkforcePlanWriteStore(first);
            var staleStore = new WorkforcePlanWriteStore(stale);
            var firstPlan = await firstStore.GetForUpdateAsync(1, CancellationToken.None);
            var stalePlan = await staleStore.GetForUpdateAsync(1, CancellationToken.None);

            Assert.NotNull(firstPlan);
            Assert.NotNull(stalePlan);
            var originalRowVersion = firstPlan!.RowVersion.ToArray();
            var requestRowVersion = Convert.ToBase64String(originalRowVersion);
            Assert.Equal(originalRowVersion, stalePlan!.RowVersion);

            // Mirror the aggregate-replacement path used by UpdateWorkforcePlanCommandHandler:
            // the logical business change is entirely in children, while ApplyRowVersion must
            // make the parent participate in SQL concurrency for the whole aggregate.
            firstStore.ApplyRowVersion(firstPlan, requestRowVersion);
            var originalLines = firstPlan.Lines.ToArray();
            firstStore.RemovePeriodTargets(originalLines.SelectMany(line => line.PeriodTargets).ToArray());
            firstStore.RemoveLines(originalLines);
            firstPlan.RemoveDraftLines();
            firstPlan.AddLine(
                positionId: 501,
                targetBranchId: null,
                departmentId: 601,
                divisionId: 701,
                baselineHeadcount: 2,
                baselineAsOfDate: new DateOnly(2027, 1, 1),
                newHireSlots: 3,
                replacementSlots: 1,
                justification: "first-writer");

            await first.SaveChangesAsync();
            var advancedRowVersion = firstPlan.RowVersion.ToArray();

            Assert.NotEqual(originalRowVersion, advancedRowVersion);

            // Deliberately avoid modifying/deleting the original stale child. The only stale
            // concurrency token involved in this second save is the parent aggregate token.
            // This proves the parent boundary, rather than accidentally passing because a
            // child rowversion also happened to be stale.
            staleStore.ApplyRowVersion(stalePlan, requestRowVersion);
            stalePlan.AddLine(
                positionId: 502,
                targetBranchId: null,
                departmentId: 602,
                divisionId: 702,
                baselineHeadcount: 4,
                baselineAsOfDate: new DateOnly(2027, 1, 1),
                newHireSlots: 1,
                replacementSlots: 0,
                justification: "stale-writer");

            await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => stale.SaveChangesAsync());

            await using var verify = CreateContext(connectionString);
            var persisted = await new WorkforcePlanWriteStore(verify)
                .GetForUpdateAsync(1, CancellationToken.None);

            Assert.NotNull(persisted);
            Assert.Equal(advancedRowVersion, persisted!.RowVersion);
            var activeLine = Assert.Single(persisted.Lines);
            Assert.Equal("first-writer", activeLine.Justification);
            Assert.DoesNotContain(persisted.Lines, line => line.Justification == "stale-writer");
        }
        finally
        {
            await DropDatabaseAsync(databaseName);
        }
    }

    private static ApplicationDbContext CreateContext(string connectionString)
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString)
            .Options;
        return new ApplicationDbContext(options, new TestActor(), TimeProvider.System);
    }

    private static async Task CreateDatabaseAsync(string databaseName)
    {
        await using var connection = new SqlConnection(
            "Server=(localdb)\\mssqllocaldb;Database=master;Trusted_Connection=True;TrustServerCertificate=True");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = $"CREATE DATABASE [{databaseName}]";
        await command.ExecuteNonQueryAsync();
    }

    private static async Task DropDatabaseAsync(string databaseName)
    {
        SqlConnection.ClearAllPools();
        await using var connection = new SqlConnection(
            "Server=(localdb)\\mssqllocaldb;Database=master;Trusted_Connection=True;TrustServerCertificate=True");
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText =
            "IF DB_ID(N'" + databaseName + "') IS NOT NULL BEGIN " +
            "ALTER DATABASE [" + databaseName + "] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; " +
            "DROP DATABASE [" + databaseName + "]; END";
        await command.ExecuteNonQueryAsync();
    }

    private static async Task CreateWorkforceTablesAsync(ApplicationDbContext context)
    {
        await context.Database.ExecuteSqlRawAsync("CREATE SCHEMA [hr] AUTHORIZATION [dbo]");

        const string sql =
            "CREATE TABLE [hr].[WorkforcePlans] (" +
            "[Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WorkforcePlans] PRIMARY KEY, " +
            "[PlanSeriesId] uniqueidentifier NOT NULL, [PlanCode] nvarchar(50) NOT NULL, " +
            "[FiscalYearId] int NOT NULL, [RevisionNumber] int NOT NULL, [PreviousRevisionId] int NULL, " +
            "[TitleEn] nvarchar(200) NOT NULL, [TitleAr] nvarchar(200) NOT NULL, [Description] nvarchar(2000) NULL, " +
            "[Status] int NOT NULL, [SubmittedOn] datetimeoffset NULL, [SubmittedById] nvarchar(max) NULL, " +
            "[ApprovedOn] datetimeoffset NULL, [ApprovedById] nvarchar(max) NULL, [RejectedOn] datetimeoffset NULL, " +
            "[RejectedById] nvarchar(max) NULL, [DecisionReason] nvarchar(max) NULL, [ActivatedOn] datetimeoffset NULL, " +
            "[SupersededOn] datetimeoffset NULL, [RowVersion] rowversion NOT NULL, " +
            "[CreatedById] nvarchar(450) NOT NULL, [CreatedOn] datetime2 NOT NULL, [CreatedByPc] nvarchar(max) NOT NULL, " +
            "[UpdatedById] nvarchar(450) NULL, [UpdatedOn] datetime2 NULL, [UpdatedByPc] nvarchar(max) NULL, " +
            "[DeletedById] nvarchar(450) NULL, [DeletedOn] datetime2 NULL, [DeletedByPc] nvarchar(max) NULL, " +
            "[IsDeleted] bit NOT NULL, [TenantId] nvarchar(32) NOT NULL, [CompanyId] int NOT NULL); " +
            "CREATE TABLE [hr].[WorkforcePlanLines] (" +
            "[Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WorkforcePlanLines] PRIMARY KEY, " +
            "[WorkforcePlanId] int NOT NULL, [PositionId] int NOT NULL, [BranchId] int NULL, " +
            "[DepartmentId] int NOT NULL, [DivisionId] int NOT NULL, [CurrentHeadcount] int NOT NULL, " +
            "[BaselineAsOfDate] date NOT NULL, [NewHireSlots] int NOT NULL, [ReplacementSlots] int NOT NULL, " +
            "[Justification] nvarchar(2000) NULL, [RowVersion] rowversion NOT NULL, " +
            "[CreatedById] nvarchar(450) NOT NULL, [CreatedOn] datetime2 NOT NULL, [CreatedByPc] nvarchar(max) NOT NULL, " +
            "[UpdatedById] nvarchar(450) NULL, [UpdatedOn] datetime2 NULL, [UpdatedByPc] nvarchar(max) NULL, " +
            "[DeletedById] nvarchar(450) NULL, [DeletedOn] datetime2 NULL, [DeletedByPc] nvarchar(max) NULL, " +
            "[IsDeleted] bit NOT NULL, [TenantId] nvarchar(32) NOT NULL, [CompanyId] int NOT NULL); " +
            "CREATE TABLE [hr].[WorkforcePlanLinePeriodTargets] (" +
            "[Id] int IDENTITY(1,1) NOT NULL CONSTRAINT [PK_WorkforcePlanLinePeriodTargets] PRIMARY KEY, " +
            "[WorkforcePlanLineId] int NOT NULL, [FiscalPeriodId] int NOT NULL, [NewHireSlots] int NOT NULL, " +
            "[ReplacementSlots] int NOT NULL, [RowVersion] rowversion NOT NULL, " +
            "[CreatedById] nvarchar(450) NOT NULL, [CreatedOn] datetime2 NOT NULL, [CreatedByPc] nvarchar(max) NOT NULL, " +
            "[UpdatedById] nvarchar(450) NULL, [UpdatedOn] datetime2 NULL, [UpdatedByPc] nvarchar(max) NULL, " +
            "[DeletedById] nvarchar(450) NULL, [DeletedOn] datetime2 NULL, [DeletedByPc] nvarchar(max) NULL, " +
            "[IsDeleted] bit NOT NULL, [TenantId] nvarchar(32) NOT NULL, [CompanyId] int NOT NULL);";

        await context.Database.ExecuteSqlRawAsync(sql);
    }

    private static Task SeedPlanAsync(ApplicationDbContext context)
    {
        const string sql =
            "SET IDENTITY_INSERT [hr].[WorkforcePlans] ON; " +
            "INSERT INTO [hr].[WorkforcePlans] (" +
            "[Id], [PlanSeriesId], [PlanCode], [FiscalYearId], [RevisionNumber], [PreviousRevisionId], " +
            "[TitleEn], [TitleAr], [Description], [Status], [SubmittedOn], [SubmittedById], [ApprovedOn], [ApprovedById], " +
            "[RejectedOn], [RejectedById], [DecisionReason], [ActivatedOn], [SupersededOn], [CreatedById], [CreatedOn], " +
            "[CreatedByPc], [UpdatedById], [UpdatedOn], [UpdatedByPc], [DeletedById], [DeletedOn], [DeletedByPc], " +
            "[IsDeleted], [TenantId], [CompanyId]) VALUES (" +
            "1, NEWID(), N'WP-2027', 1, 1, NULL, N'Plan', N'Workforce Plan', NULL, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, " +
            "NULL, NULL, N'admin', SYSUTCDATETIME(), N'test', NULL, NULL, NULL, NULL, NULL, NULL, 0, N'tenant-1', 11); " +
            "SET IDENTITY_INSERT [hr].[WorkforcePlans] OFF; " +
            "SET IDENTITY_INSERT [hr].[WorkforcePlanLines] ON; " +
            "INSERT INTO [hr].[WorkforcePlanLines] (" +
            "[Id], [WorkforcePlanId], [PositionId], [BranchId], [DepartmentId], [DivisionId], [CurrentHeadcount], " +
            "[BaselineAsOfDate], [NewHireSlots], [ReplacementSlots], [Justification], [CreatedById], [CreatedOn], [CreatedByPc], " +
            "[UpdatedById], [UpdatedOn], [UpdatedByPc], [DeletedById], [DeletedOn], [DeletedByPc], [IsDeleted], [TenantId], [CompanyId]) " +
            "VALUES (10, 1, 500, NULL, 600, 700, 2, '2027-01-01', 2, 1, N'initial', N'admin', SYSUTCDATETIME(), N'test', " +
            "NULL, NULL, NULL, NULL, NULL, NULL, 0, N'tenant-1', 11); " +
            "SET IDENTITY_INSERT [hr].[WorkforcePlanLines] OFF;";

        return context.Database.ExecuteSqlRawAsync(sql);
    }
    private sealed class TestActor : ICurrentActor
    {
        public string? UserId => "admin";
        public string? TenantId => "tenant-1";
        public int? CompanyId => 11;
    }
}
