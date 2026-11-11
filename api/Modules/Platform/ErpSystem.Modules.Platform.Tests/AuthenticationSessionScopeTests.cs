using ErpSystem.Modules.Platform.Contracts.Authentication.Tokens;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class AuthenticationSessionScopeTests
{
    [Theory]
    [InlineData("system", null, null, true)]
    [InlineData("system", "tenant", "1", false)]
    [InlineData("system", "", null, false)]
    [InlineData("system", null, "0", false)]
    [InlineData("unknown", "tenant", "1", false)]
    [InlineData(null, "tenant", "1", true)]
    [InlineData("company", "tenant", "1", true)]
    [InlineData("company", null, null, false)]
    [InlineData(null, null, null, false)]
    [InlineData("company", "tenant", "0", false)]
    public void ScopeCoordinates_FailClosedExceptLegacyCompanyAndExplicitSystem(
        string? scope, string? tenant, string? company, bool expected) =>
        Assert.Equal(expected, AuthenticationSessionScope.TryResolve(scope, tenant, company, out _, out _));
}
