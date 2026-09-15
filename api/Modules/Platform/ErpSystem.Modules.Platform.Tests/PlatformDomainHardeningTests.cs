using System.Reflection;
using ErpSystem.BuildingBlocks.Domain.Exceptions;
using ErpSystem.Modules.Platform.Application.Features.Security.ApiKeys.Contracts;
using ErpSystem.Modules.Platform.Domain.Security.ApiKeys.Entities;
using ErpSystem.Modules.Platform.Infrastructure.Realtime;
using ErpSystem.Modules.Platform.Presentation.Features.Platform.Files.V1;
using Microsoft.AspNetCore.RateLimiting;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class PlatformDomainHardeningTests
{
    private static readonly DateTime UtcNow = new(2026, 8, 11, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ApiKey_RevokedSecretCannotBeUsedOrUpdated()
    {
        var apiKey = ApiKey.Create(
            new string('A', 64),
            "hrk_example",
            "https://localhost:3000/reports",
            "Reporting",
            UtcNow,
            UtcNow.AddDays(7));

        apiKey.Revoke("No longer required", UtcNow.AddHours(1));

        Assert.Equal("https://localhost:3000", apiKey.ClientUri);
        Assert.False(apiKey.IsUsableAt(UtcNow.AddHours(1)));
        var exception = Assert.Throws<DomainRuleException>(() =>
            apiKey.UpdateDetails(
                "https://localhost:3001",
                "Changed",
                UtcNow.AddDays(8),
                UtcNow.AddHours(2)));
        Assert.Equal("ApiKey.Revoked", exception.Code);
    }

    [Fact]
    public void ApiKey_ReadResponseNeverExposesSecretOrHash()
    {
        var propertyNames = typeof(ApiKeyResponse)
            .GetProperties()
            .Select(property => property.Name)
            .ToHashSet(StringComparer.Ordinal);

        Assert.DoesNotContain("Secret", propertyNames);
        Assert.DoesNotContain("KeyHash", propertyNames);
        Assert.Contains("KeyPrefix", propertyNames);
    }

    [Fact]
    public void GeneralHub_DoesNotExposeClientInvokableBroadcastMethods()
    {
        var methods = typeof(GeneralHub)
            .GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(method =>
                !method.IsSpecialName
                && method.GetBaseDefinition().DeclaringType == typeof(GeneralHub))
            .ToArray();

        Assert.Empty(methods);
    }

    [Fact]
    public void FilesController_UsesFileOperationsRateLimit()
    {
        var attribute = typeof(FilesController).GetCustomAttribute<EnableRateLimitingAttribute>();

        Assert.NotNull(attribute);
        Assert.Equal("fileOperations", attribute.PolicyName);
    }
}
