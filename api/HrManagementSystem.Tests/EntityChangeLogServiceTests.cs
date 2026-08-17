using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Infrastructure.Features.Platform.EntityChangeLogs.Services;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HrManagementSystem.Tests;

public sealed class EntityChangeLogServiceTests
{
    [Fact]
    public async Task CreateChangeLogAsync_StringEntityKey_PreservesMixedValueTypes()
    {
        var actor = new TestCurrentActor("actor-1", "tenant-1", 7);
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        await using var context = new ApplicationDbContext(options, actor, TimeProvider.System);
        var service = new EntityChangeLogService(context, actor, TimeProvider.System);

        var result = await service.CreateChangeLogAsync(
            "user-123",
            "ApplicationUser",
            new UserSnapshot("Before", false, 4),
            new UserSnapshot("After", true, 7));
        var changes = await service.GetChangeLogKeyValuesAsync();

        Assert.NotNull(result);
        Assert.Equal("user-123", result.EntityKey);
        Assert.Collection(
            changes.OrderBy(change => change.Key),
            change => AssertChange(change.ChangeLogId, change.Key, change.OldValue, change.NewValue,
                "user-123", "CompanyId", "4", "7"),
            change => AssertChange(change.ChangeLogId, change.Key, change.OldValue, change.NewValue,
                "user-123", "IsDisabled", "false", "true"),
            change => AssertChange(change.ChangeLogId, change.Key, change.OldValue, change.NewValue,
                "user-123", "Name", "Before", "After"));
    }

    private static void AssertChange(
        string actualEntityKey,
        string actualKey,
        string actualOldValue,
        string actualNewValue,
        string expectedEntityKey,
        string expectedKey,
        string expectedOldValue,
        string expectedNewValue)
    {
        Assert.Equal(expectedEntityKey, actualEntityKey);
        Assert.Equal(expectedKey, actualKey);
        Assert.Equal(expectedOldValue, actualOldValue);
        Assert.Equal(expectedNewValue, actualNewValue);
    }

    private sealed record UserSnapshot(string Name, bool IsDisabled, int CompanyId);

    private sealed record TestCurrentActor(
        string? UserId,
        string? TenantId,
        int? CompanyId) : ICurrentActor;
}
