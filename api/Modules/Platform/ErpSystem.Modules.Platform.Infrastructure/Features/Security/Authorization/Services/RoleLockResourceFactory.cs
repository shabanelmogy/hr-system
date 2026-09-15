using System.Security.Cryptography;
using System.Text;
using ErpSystem.Modules.Platform.Application.Features.Security.Authorization.Abstractions;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Security.Authorization.Services;

public sealed class RoleLockResourceFactory : IRoleLockResourceFactory
{
    public string Create(string tenantId, string discriminator)
    {
        var hash = Convert.ToHexString(SHA256.HashData(
            Encoding.UTF8.GetBytes($"role|{tenantId}|{discriminator}")));
        return $"ErpSystem:Platform:Role:{hash[..32]}";
    }
}
