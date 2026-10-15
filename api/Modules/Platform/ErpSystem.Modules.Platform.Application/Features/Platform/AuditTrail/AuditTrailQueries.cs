using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Modules.Platform.Application.Features.Platform.AuditTrail;

public sealed record AuditTrailQueryRequest
{
    public const int DefaultPageSize = 25;
    public const int MaxPageSize = 100;

    /// <summary>Platform administrators only: limit to one tenant (empty = all tenants).</summary>
    public string? TenantId { get; init; }
    public string? ModuleCode { get; init; }
    public string? EntityName { get; init; }
    public string? EntityKey { get; init; }
    public AuditAction? Action { get; init; }
    public string? UserId { get; init; }
    public DateTime? FromUtc { get; init; }
    public DateTime? ToUtc { get; init; }

    /// <summary>The <c>nextCursor</c> of the previous page; empty for the first page.</summary>
    public string? Cursor { get; init; }
    public int PageSize { get; init; } = DefaultPageSize;
}

public sealed record AuditTrailItemResponse(
    string ModuleCode,
    long Id,
    string EntityName,
    string EntityKey,
    string? EntityDisplay,
    string Action,
    string? UserId,
    string? UserName,
    DateTime OccurredOn,
    string? CorrelationId,
    int ChangeCount);

public sealed record AuditTrailPageResponse(
    IReadOnlyList<AuditTrailItemResponse> Items,
    string? NextCursor);

public sealed record AuditTrailDetailsResponse(
    AuditTrailItemResponse Entry,
    IReadOnlyList<AuditFieldChange> Changes);

public sealed record AuditTrailModuleFilter(string ModuleCode, IReadOnlyList<string> EntityNames);

public sealed record AuditTrailFiltersResponse(IReadOnlyList<AuditTrailModuleFilter> Modules);

/// <summary>Resolves user ids stored in audit entries to display names.</summary>
public interface IAuditTrailUserDirectory
{
    Task<IReadOnlyDictionary<string, string>> GetDisplayNamesAsync(
        IReadOnlyCollection<string> userIds,
        CancellationToken cancellationToken = default);
}

public sealed record GetAuditTrailQuery(AuditTrailQueryRequest Request)
    : IQuery<Result<AuditTrailPageResponse>>;

public sealed record GetAuditTrailEntryQuery(string ModuleCode, long Id)
    : IQuery<Result<AuditTrailDetailsResponse>>;

public sealed record GetAuditTrailFiltersQuery(string? TenantId)
    : IQuery<Result<AuditTrailFiltersResponse>>;

public sealed class GetAuditTrailQueryValidator : AbstractValidator<GetAuditTrailQuery>
{
    public GetAuditTrailQueryValidator()
    {
        RuleFor(query => query.Request).NotNull();
        RuleFor(query => query.Request.PageSize)
            .InclusiveBetween(1, AuditTrailQueryRequest.MaxPageSize);
        RuleFor(query => query.Request.TenantId).MaximumLength(64);
        RuleFor(query => query.Request.ModuleCode).MaximumLength(100);
        RuleFor(query => query.Request.EntityName).MaximumLength(200);
        RuleFor(query => query.Request.EntityKey).MaximumLength(200);
        RuleFor(query => query.Request.UserId).MaximumLength(450);
        RuleFor(query => query.Request.Cursor).MaximumLength(400);
        RuleFor(query => query.Request.Action).IsInEnum().When(query => query.Request.Action.HasValue);
        RuleFor(query => query.Request.ToUtc)
            .GreaterThanOrEqualTo(query => query.Request.FromUtc)
            .When(query => query.Request.FromUtc.HasValue && query.Request.ToUtc.HasValue);
    }
}

public sealed class GetAuditTrailEntryQueryValidator : AbstractValidator<GetAuditTrailEntryQuery>
{
    public GetAuditTrailEntryQueryValidator()
    {
        RuleFor(query => query.ModuleCode).NotEmpty().MaximumLength(100);
        RuleFor(query => query.Id).GreaterThan(0);
    }
}

/// <summary>
/// Merges every module's audit trail into one newest-first list. Each module keeps its
/// own table; this handler only asks the registered <see cref="IAuditTrailSource"/>s.
/// </summary>
public sealed class GetAuditTrailQueryHandler(
    IEnumerable<IAuditTrailSource> sources,
    IAuditTrailUserDirectory users,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetAuditTrailQuery, Result<AuditTrailPageResponse>>
{
    private static readonly Error InvalidCursor = new(
        "AuditTrail.InvalidCursor",
        "The page cursor is not valid.",
        ErrorType.Validation);

    public async Task<Result<AuditTrailPageResponse>> Handle(
        GetAuditTrailQuery query,
        CancellationToken cancellationToken)
    {
        var request = query.Request;
        if (AuditTrailReadScope.Resolve(executionContext, request.TenantId) is not { } scope)
            return Result.Failure<AuditTrailPageResponse>(AuditTrailReadScope.ScopeError(executionContext));

        AuditTrailCursor? after = null;
        if (!string.IsNullOrWhiteSpace(request.Cursor))
        {
            after = AuditTrailCursorCodec.Decode(request.Cursor);
            if (after is null)
                return Result.Failure<AuditTrailPageResponse>(InvalidCursor);
        }

        // One extra row tells whether another page exists.
        var take = request.PageSize + 1;
        var filter = new AuditTrailFilter(
            scope.TenantId,
            scope.CompanyId,
            AuditTrailReadScope.Normalize(request.EntityName),
            AuditTrailReadScope.Normalize(request.EntityKey),
            request.Action,
            AuditTrailReadScope.Normalize(request.UserId),
            AsUtc(request.FromUtc),
            AsUtc(request.ToUtc),
            after,
            take);

        var moduleCode = AuditTrailReadScope.Normalize(request.ModuleCode);
        var merged = new List<AuditTrailRecord>();
        foreach (var source in sources.Where(source =>
                     moduleCode is null || string.Equals(source.ModuleCode, moduleCode, StringComparison.Ordinal)))
        {
            merged.AddRange(await source.ListAsync(filter, cancellationToken).ConfigureAwait(false));
        }

        var ordered = merged
            .OrderByDescending(record => record.OccurredOnUtc)
            .ThenBy(record => record.ModuleCode, StringComparer.Ordinal)
            .ThenByDescending(record => record.Id)
            .Take(take)
            .ToList();
        var hasMore = ordered.Count > request.PageSize;
        if (hasMore)
            ordered.RemoveAt(ordered.Count - 1);

        var names = await AuditTrailReadScope.UserNamesAsync(users, ordered, cancellationToken).ConfigureAwait(false);
        var nextCursor = hasMore && ordered.Count > 0
            ? AuditTrailCursorCodec.Encode(ordered[^1])
            : null;
        return Result.Success(new AuditTrailPageResponse(
            ordered.Select(record => AuditTrailReadScope.ToResponse(record, names)).ToArray(),
            nextCursor));
    }

    private static DateTime? AsUtc(DateTime? value) => value switch
    {
        null => null,
        { Kind: DateTimeKind.Utc } utc => utc,
        { Kind: DateTimeKind.Local } local => local.ToUniversalTime(),
        { } unspecified => DateTime.SpecifyKind(unspecified, DateTimeKind.Utc)
    };
}

public sealed class GetAuditTrailEntryQueryHandler(
    IEnumerable<IAuditTrailSource> sources,
    IAuditTrailUserDirectory users,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetAuditTrailEntryQuery, Result<AuditTrailDetailsResponse>>
{
    private static readonly Error NotFound = new(
        "AuditTrail.NotFound",
        "The audit trail entry was not found.",
        ErrorType.NotFound);

    public async Task<Result<AuditTrailDetailsResponse>> Handle(
        GetAuditTrailEntryQuery query,
        CancellationToken cancellationToken)
    {
        if (AuditTrailReadScope.Resolve(executionContext, null) is not { } scope)
            return Result.Failure<AuditTrailDetailsResponse>(AuditTrailReadScope.ScopeError(executionContext));
        var moduleCode = query.ModuleCode.Trim();
        var source = sources.FirstOrDefault(item =>
            string.Equals(item.ModuleCode, moduleCode, StringComparison.Ordinal));
        if (source is null)
            return Result.Failure<AuditTrailDetailsResponse>(NotFound);

        var details = await source
            .GetAsync(query.Id, scope.TenantId, scope.CompanyId, cancellationToken)
            .ConfigureAwait(false);
        if (details is null)
            return Result.Failure<AuditTrailDetailsResponse>(NotFound);

        var names = await AuditTrailReadScope.UserNamesAsync(users, [details.Record], cancellationToken).ConfigureAwait(false);
        return Result.Success(new AuditTrailDetailsResponse(
            AuditTrailReadScope.ToResponse(details.Record, names),
            details.Changes));
    }
}

public sealed class GetAuditTrailFiltersQueryHandler(
    IEnumerable<IAuditTrailSource> sources,
    ICurrentExecutionContext executionContext)
    : IQueryHandler<GetAuditTrailFiltersQuery, Result<AuditTrailFiltersResponse>>
{
    public async Task<Result<AuditTrailFiltersResponse>> Handle(
        GetAuditTrailFiltersQuery query,
        CancellationToken cancellationToken)
    {
        if (AuditTrailReadScope.Resolve(executionContext, query.TenantId) is not { } scope)
            return Result.Failure<AuditTrailFiltersResponse>(AuditTrailReadScope.ScopeError(executionContext));

        var modules = new List<AuditTrailModuleFilter>();
        foreach (var source in sources.OrderBy(source => source.ModuleCode, StringComparer.Ordinal))
        {
            var entityNames = await source
                .ListEntityNamesAsync(scope.TenantId, scope.CompanyId, cancellationToken)
                .ConfigureAwait(false);
            if (entityNames.Count > 0)
                modules.Add(new AuditTrailModuleFilter(source.ModuleCode, entityNames));
        }

        return Result.Success(new AuditTrailFiltersResponse(modules));
    }
}

/// <summary>
/// Who may read which entries. Platform administrators may read every tenant (or one
/// they pick); everyone else reads their own tenant and company plus tenant-wide entries.
/// </summary>
internal static class AuditTrailReadScope
{
    private static readonly Error MissingTenant = new(
        "AuditTrail.MissingTenant",
        "A tenant context is required.",
        ErrorType.Forbidden);
    private static readonly Error MissingCompany = new(
        "AuditTrail.MissingCompany",
        "A company context is required.",
        ErrorType.Forbidden);

    public static Scope? Resolve(ICurrentExecutionContext executionContext, string? requestedTenantId)
    {
        if (executionContext.IsInRole(PlatformRoleNames.SuperAdmin))
            return new Scope(Normalize(requestedTenantId), null);

        if (string.IsNullOrWhiteSpace(executionContext.TenantId) ||
            executionContext.CompanyId is null or <= 0)
        {
            return null;
        }

        return new Scope(executionContext.TenantId, executionContext.CompanyId);
    }

    public static Error ScopeError(ICurrentExecutionContext executionContext) =>
        string.IsNullOrWhiteSpace(executionContext.TenantId) ? MissingTenant : MissingCompany;

    public static async Task<IReadOnlyDictionary<string, string>> UserNamesAsync(
        IAuditTrailUserDirectory users,
        IReadOnlyCollection<AuditTrailRecord> records,
        CancellationToken cancellationToken)
    {
        var userIds = records
            .Select(record => record.UserId)
            .OfType<string>()
            .Where(userId => userId.Length > 0)
            .Distinct(StringComparer.Ordinal)
            .ToArray();
        return userIds.Length == 0
            ? new Dictionary<string, string>(StringComparer.Ordinal)
            : await users.GetDisplayNamesAsync(userIds, cancellationToken).ConfigureAwait(false);
    }

    public static AuditTrailItemResponse ToResponse(
        AuditTrailRecord record,
        IReadOnlyDictionary<string, string> names) => new(
        record.ModuleCode,
        record.Id,
        record.EntityName,
        record.EntityKey,
        record.EntityDisplay,
        record.Action.ToString(),
        record.UserId,
        record.UserId is not null && names.TryGetValue(record.UserId, out var name) ? name : null,
        record.OccurredOnUtc,
        record.CorrelationId,
        record.ChangeCount);

    public static string? Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    public sealed record Scope(string? TenantId, int? CompanyId);
}

/// <summary>Opaque keyset cursor: base64url of "{ticks}~{moduleCode}~{id}".</summary>
public static class AuditTrailCursorCodec
{
    public static string Encode(AuditTrailRecord record)
    {
        var raw = string.Create(
            CultureInfo.InvariantCulture,
            $"{record.OccurredOnUtc.Ticks}~{record.ModuleCode}~{record.Id}");
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(raw))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    public static AuditTrailCursor? Decode(string cursor)
    {
        try
        {
            var base64 = cursor.Trim().Replace('-', '+').Replace('_', '/');
            base64 = base64.PadRight(base64.Length + ((4 - (base64.Length % 4)) % 4), '=');
            var parts = Encoding.UTF8.GetString(Convert.FromBase64String(base64)).Split('~');
            if (parts.Length != 3 ||
                !long.TryParse(parts[0], NumberStyles.None, CultureInfo.InvariantCulture, out var ticks) ||
                ticks < DateTime.MinValue.Ticks || ticks > DateTime.MaxValue.Ticks ||
                string.IsNullOrWhiteSpace(parts[1]) ||
                !long.TryParse(parts[2], NumberStyles.None, CultureInfo.InvariantCulture, out var id))
            {
                return null;
            }

            return new AuditTrailCursor(new DateTime(ticks, DateTimeKind.Utc), parts[1], id);
        }
        catch (FormatException)
        {
            return null;
        }
    }
}
