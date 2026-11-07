using ErpSystem.Modules.Platform.Application.Features.Platform.AuditTrail;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.AuditTrail;

/// <summary>Resolves audit-trail user ids to "First Last" (or the user name).</summary>
public sealed class AuditTrailUserDirectory(PlatformDbContext context) : IAuditTrailUserDirectory
{
    public async Task<IReadOnlyCollection<string>> GetMatchingIdsAsync(
        IReadOnlyList<ErpSystem.BuildingBlocks.Application.Filtering.ColumnFilterGroup> filters,
        CancellationToken cancellationToken = default)
    {
        var selectors = new Dictionary<string, System.Linq.Expressions.LambdaExpression>
        {
            ["userName"] = (System.Linq.Expressions.Expression<Func<Identity.PlatformApplicationUser, string>>)
                (user => ((user.FirstName ?? "") + " " + (user.LastName ?? "")).Trim().Length > 0
                    ? ((user.FirstName ?? "") + " " + (user.LastName ?? "")).Trim()
                    : user.UserName ?? user.Id)
        };
        return await context.Users.IgnoreQueryFilters().AsNoTracking()
            .Where(ErpSystem.BuildingBlocks.Application.Filtering.ColumnFilterSet.Predicate<Identity.PlatformApplicationUser>(filters, selectors))
            .Select(user => user.Id).ToArrayAsync(cancellationToken).ConfigureAwait(false);
    }
    public async Task<IReadOnlyDictionary<string, string>> GetDisplayNamesAsync(
        IReadOnlyCollection<string> userIds,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(userIds);
        if (userIds.Count == 0)
            return new Dictionary<string, string>(StringComparer.Ordinal);

        var users = await context.Users
            .IgnoreQueryFilters()
            .AsNoTracking()
            .Where(user => userIds.Contains(user.Id))
            .Select(user => new { user.Id, user.FirstName, user.LastName, user.UserName })
            .ToListAsync(cancellationToken)
            .ConfigureAwait(false);

        return users.ToDictionary(
            user => user.Id,
            user =>
            {
                var fullName = $"{user.FirstName} {user.LastName}".Trim();
                return fullName.Length > 0 ? fullName : user.UserName ?? user.Id;
            },
            StringComparer.Ordinal);
    }
}
