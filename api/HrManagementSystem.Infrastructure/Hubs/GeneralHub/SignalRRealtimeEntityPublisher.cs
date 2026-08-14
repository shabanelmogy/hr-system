using HrManagementSystem.Application.Common.Realtime;

namespace HrManagementSystem.Infrastructure.Hubs.GeneralHub;

public sealed class SignalRRealtimeEntityPublisher(
    IHubContext<GeneralHub, IGeneralHubClient> hubContext,
    TimeProvider timeProvider) : IRealtimeEntityPublisher
{
    private static readonly HashSet<string> KnownPermissions =
        Permissions.GetAllPermissions().ToHashSet(StringComparer.Ordinal);

    public Task PublishAsync(
        RealtimeChangeRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);
        cancellationToken.ThrowIfCancellationRequested();

        var group = ResolveGroup(request.Audience);
        var change = new RealtimeEntityChanged(
            request.EventId,
            timeProvider.GetUtcNow().UtcDateTime,
            Required(request.Resource, nameof(request.Resource)),
            Required(request.Action, nameof(request.Action)),
            request.EntityId);

        return hubContext.Clients.Group(group).ReceiveEntityChanged(change);
    }

    internal static string ResolveGroup(RealtimeAudience audience)
    {
        ArgumentNullException.ThrowIfNull(audience);

        return audience.Kind switch
        {
            RealtimeAudienceKind.Permission =>
                GeneralHubGroups.ForPermission(KnownPermission(audience.Permission)),
            RealtimeAudienceKind.Company =>
                GeneralHubGroups.ForCompany(
                    Required(audience.TenantId, nameof(audience.TenantId)),
                    PositiveCompanyId(audience.CompanyId)),
            RealtimeAudienceKind.CompanyPermission =>
                GeneralHubGroups.ForCompanyPermission(
                    Required(audience.TenantId, nameof(audience.TenantId)),
                    PositiveCompanyId(audience.CompanyId),
                    KnownPermission(audience.Permission)),
            RealtimeAudienceKind.UserCompany =>
                GeneralHubGroups.ForUserCompany(
                    Required(audience.TenantId, nameof(audience.TenantId)),
                    PositiveCompanyId(audience.CompanyId),
                    Required(audience.UserId, nameof(audience.UserId))),
            RealtimeAudienceKind.Role =>
                GeneralHubGroups.ForRole(Required(audience.Role, nameof(audience.Role))),
            _ => throw new ArgumentOutOfRangeException(
                nameof(audience), audience.Kind, "Unsupported realtime audience kind.")
        };
    }

    private static string KnownPermission(string? permission)
    {
        var value = Required(permission, nameof(permission));
        return KnownPermissions.Contains(value)
            ? value
            : throw new ArgumentException("The realtime audience permission is not recognized.", nameof(permission));
    }

    private static string Required(string? value, string parameterName) =>
        string.IsNullOrWhiteSpace(value)
            ? throw new ArgumentException("A non-empty value is required.", parameterName)
            : value.Trim();

    private static int PositiveCompanyId(int? companyId) =>
        companyId is > 0
            ? companyId.Value
            : throw new ArgumentOutOfRangeException(nameof(companyId), "Company ID must be positive.");
}
