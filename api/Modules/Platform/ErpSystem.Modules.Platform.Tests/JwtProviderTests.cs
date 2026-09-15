using ErpSystem.Modules.Platform.Infrastructure.Authentication.Tokens;
using ErpSystem.Modules.Platform.Infrastructure;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class JwtProviderTests
{
    [Fact]
    public void JwtTokenServicesAreOwnedByPlatformInfrastructure()
    {
        Assert.StartsWith("ErpSystem.Modules.Platform", typeof(JwtAuthenticationTokenService).Assembly.GetName().Name, StringComparison.Ordinal);
        Assert.DoesNotContain(typeof(JwtAuthenticationTokenService).GetConstructors().SelectMany(constructor => constructor.GetParameters()), parameter => parameter.ParameterType == typeof(PlatformDbContext));
    }
}