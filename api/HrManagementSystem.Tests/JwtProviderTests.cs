using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HrManagementSystem.Infrastructure.Security.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HrManagementSystem.Tests;

public sealed class JwtProviderTests
{
    private const string SigningKey = "test-only-signing-key-with-more-than-thirty-two-characters";

    [Fact]
    public void ValidateExpiredAccessToken_AcceptsExpiredTokenFromConfiguredIssuerAndAudience()
    {
        var provider = CreateProvider();
        var token = CreateToken("HrManagementSystem", "HrManagementSystem.Web");

        var result = provider.ValidateExpiredAccessToken(token);

        Assert.NotNull(result);
        Assert.Equal("user-id", result.UserId);
        Assert.Equal("jwt-id", result.JwtId);
        Assert.Equal("session-id", result.SessionId);
    }

    [Theory]
    [InlineData("another-issuer", "HrManagementSystem.Web")]
    [InlineData("HrManagementSystem", "another-audience")]
    public void ValidateExpiredAccessToken_RejectsWrongIssuerOrAudience(
        string issuer,
        string audience)
    {
        var provider = CreateProvider();
        var token = CreateToken(issuer, audience);

        Assert.Null(provider.ValidateExpiredAccessToken(token));
    }

    private static JwtProvider CreateProvider()
    {
        var options = Options.Create(new JwtOptions
        {
            Key = SigningKey,
            Issuer = "HrManagementSystem",
            Audience = "HrManagementSystem.Web",
            ExpireInMinutes = 10,
            RealtimeExpireInMinutes = 2
        });

        return new JwtProvider(options, null!, null!, null!);
    }

    private static string CreateToken(string issuer, string audience)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "user-id"),
            new Claim(JwtRegisteredClaimNames.Jti, "jwt-id"),
            new Claim(JwtClaimNames.SessionId, "session-id"),
            new Claim(JwtClaimNames.SecurityStamp, "security-stamp")
        };

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            notBefore: DateTime.UtcNow.AddMinutes(-20),
            expires: DateTime.UtcNow.AddMinutes(-10),
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
                SecurityAlgorithms.HmacSha256));

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
