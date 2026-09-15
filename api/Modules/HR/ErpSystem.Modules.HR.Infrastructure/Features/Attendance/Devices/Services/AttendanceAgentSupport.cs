using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using ErpSystem.Modules.HR.Application.Features.Attendance.Devices.Contracts;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Attendance.Devices.Services;

/// <summary>Authenticates the site agent before an actor scope is established, so it intentionally bypasses tenant filters.</summary>
public sealed class AttendanceAgentAuthenticator(ApplicationDbContext context) : IAttendanceAgentAuthenticator
{
    public async Task<AttendanceAgentSession?> AuthenticateAsync(Guid agentId, string enrollmentToken, CancellationToken cancellationToken)
    {
        if (agentId == Guid.Empty || string.IsNullOrWhiteSpace(enrollmentToken) || enrollmentToken.Length > 256)
            return null;

        var agent = await context.AttendanceAgents.IgnoreQueryFilters()
            .Where(x => x.Id == agentId && x.IsActive)
            .Select(x => new { x.Id, x.TenantId, x.CompanyId, x.CreatedById, x.SecretHash })
            .SingleOrDefaultAsync(cancellationToken);
        if (agent is null || string.IsNullOrWhiteSpace(agent.CreatedById)) return null;

        var supplied = SHA256.HashData(Encoding.UTF8.GetBytes(enrollmentToken));
        byte[] expected;
        try { expected = Convert.FromHexString(agent.SecretHash); }
        catch (FormatException) { return null; }
        if (!CryptographicOperations.FixedTimeEquals(expected, supplied)) return null;

        return new AttendanceAgentSession(agent.Id, agent.TenantId, agent.CompanyId, agent.CreatedById);
    }
}

public sealed class AttendanceAgentInstallationSettings(IConfiguration configuration) : IAttendanceAgentInstallationSettings
{
    public string HostedApiBaseUrl
    {
        get
        {
            var value = configuration["AttendanceAgent:PublicBaseUrl"]?.Trim();
            if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
                throw new InvalidOperationException("AttendanceAgent:PublicBaseUrl must be an absolute HTTPS URL.");
            return uri.GetLeftPart(UriPartial.Authority).TrimEnd('/');
        }
    }

    public int PollIntervalSeconds => Math.Clamp(configuration.GetValue<int?>("AttendanceAgent:PollIntervalSeconds") ?? 15, 5, 300);
}

public sealed class AttendanceAgentCredentialGenerator : IAttendanceAgentCredentialGenerator
{
    public AttendanceAgentCredential Create()
    {
        var secret = $"hra_{ToBase64Url(RandomNumberGenerator.GetBytes(32))}";
        return new AttendanceAgentCredential(
            secret,
            Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(secret))),
            secret[..Math.Min(secret.Length, 16)]);
    }

    private static string ToBase64Url(byte[] value) => Convert.ToBase64String(value)
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');
}

public sealed class AttendanceEventKeyGenerator : IAttendanceEventKeyGenerator
{
    public string Create(string providerId, ConnectorPunch punch)
    {
        // Names and configured timezone are mutable metadata, not device event identity.
        var identity = !string.IsNullOrWhiteSpace(punch.ProviderEventId)
            ? JsonSerializer.Serialize(new { providerId, eventId = punch.ProviderEventId })
            : JsonSerializer.Serialize(new
            {
                providerId,
                punch.ExternalCode,
                local = DateTime.SpecifyKind(punch.OccurredAtDeviceLocal, DateTimeKind.Unspecified)
                    .ToString("O", CultureInfo.InvariantCulture),
                punch.VerifyMode,
                punch.InOutMode,
                punch.WorkCode
            });

        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(identity)));
    }
}
