using System.Globalization;
using System.Runtime.CompilerServices;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Application.Abstractions.AuditTrail;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.BuildingBlocks.Domain.Abstractions;
using ErpSystem.BuildingBlocks.Domain.Auditing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

/// <summary>
/// Records every insert, update, delete and restore of an <see cref="IAuditedEntity"/>
/// in the module's own <see cref="AuditTrailEntry"/> table. Feature code never writes
/// audit rows: updates and deletes are added to the same SaveChanges, and inserts are
/// written right after it inside one transaction, once generated keys are known.
/// </summary>
public sealed class AuditTrailSaveChangesInterceptor : SaveChangesInterceptor
{
    private const int MaxValueLength = 2000;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    // Bookkeeping columns, scope columns and identity internals: they change on every
    // save or are shown elsewhere, so recording them would only hide the real change.
    private static readonly HashSet<string> ExcludedProperties = new(StringComparer.Ordinal)
    {
        "RowVersion",
        "CreatedById", "CreatedOn", "CreatedByPc",
        "UpdatedById", "UpdatedOn", "UpdatedByPc",
        "DeletedById", "DeletedOn", "DeletedByPc",
        "IsDeleted",
        "TenantId", "CompanyId",
        "ConcurrencyStamp", "SecurityStamp",
        "NormalizedEmail", "NormalizedUserName", "NormalizedName",
        "AccessFailedCount", "LockoutEnd"
    };

    // Values that must never be copied into the trail, whatever the entity.
    private static readonly string[] SensitiveNameFragments =
        ["Password", "Secret", "Token", "Hash", "Salt", "PrivateKey"];

    // First non-empty one becomes the human-readable label shown in the list.
    private static readonly string[] DisplayProperties =
        ["NameAr", "NameEn", "Name", "FullName", "Title", "Code", "UserName", "Email"];

    private readonly string _moduleCode;
    private readonly ICurrentExecutionContext? _executionContext;
    private readonly TimeProvider _timeProvider;
    private readonly ConditionalWeakTable<DbContext, SaveState> _states = new();

    public AuditTrailSaveChangesInterceptor(
        string moduleCode,
        ICurrentExecutionContext? executionContext,
        TimeProvider timeProvider)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(moduleCode);
        ArgumentNullException.ThrowIfNull(timeProvider);
        _moduleCode = moduleCode;
        _executionContext = executionContext;
        _timeProvider = timeProvider;
    }

    public string ModuleCode => _moduleCode;

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (CaptureBeforeSave(eventData.Context) is { } context)
            context.Database.BeginTransaction();
        return result;
    }

    public override async ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (CaptureBeforeSave(eventData.Context) is { } context)
            await context.Database.BeginTransactionAsync(cancellationToken).ConfigureAwait(false);
        return result;
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        if (TakePendingCreations(eventData.Context) is not { } work)
            return result;

        var (context, state) = work;
        try
        {
            context.SaveChanges();
            if (state.OwnsTransaction)
                context.Database.CurrentTransaction?.Commit();
        }
        catch
        {
            if (state.OwnsTransaction)
                context.Database.CurrentTransaction?.Rollback();
            throw;
        }
        finally
        {
            EndFlush(context, state);
        }

        return result;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (TakePendingCreations(eventData.Context) is not { } work)
            return result;

        var (context, state) = work;
        try
        {
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            if (state.OwnsTransaction && context.Database.CurrentTransaction is { } transaction)
                await transaction.CommitAsync(cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            if (state.OwnsTransaction && context.Database.CurrentTransaction is { } transaction)
                await transaction.RollbackAsync(CancellationToken.None).ConfigureAwait(false);
            throw;
        }
        finally
        {
            EndFlush(context, state);
        }

        return result;
    }

    public override void SaveChangesFailed(DbContextErrorEventData eventData) =>
        AbandonSave(eventData.Context);

    public override Task SaveChangesFailedAsync(
        DbContextErrorEventData eventData,
        CancellationToken cancellationToken = default)
    {
        AbandonSave(eventData.Context);
        return Task.CompletedTask;
    }

    public override void SaveChangesCanceled(DbContextEventData eventData) =>
        AbandonSave(eventData.Context);

    public override Task SaveChangesCanceledAsync(
        DbContextEventData eventData,
        CancellationToken cancellationToken = default)
    {
        AbandonSave(eventData.Context);
        return Task.CompletedTask;
    }

    /// <summary>
    /// Stages update/delete rows and remembers inserts. Returns the context when the
    /// caller must open a transaction so the deferred insert rows commit atomically.
    /// </summary>
    private DbContext? CaptureBeforeSave(DbContext? context)
    {
        if (context is null || context.Model.FindEntityType(typeof(AuditTrailEntry)) is null)
            return null;

        var state = _states.GetOrCreateValue(context);
        if (state.Flushing)
            return null;

        state.Pending.Clear();
        state.OwnsTransaction = false;
        state.OccurredOnUtc = _timeProvider.GetUtcNow().UtcDateTime;

        context.ChangeTracker.DetectChanges();
        var audited = context.ChangeTracker.Entries().Where(IsAudited).ToList();
        foreach (var entry in audited)
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    state.Pending.Add(entry);
                    break;
                case EntityState.Modified:
                    if (CaptureModified(entry, state.OccurredOnUtc) is { } modified)
                        context.Set<AuditTrailEntry>().Add(modified);
                    break;
                case EntityState.Deleted:
                    context.Set<AuditTrailEntry>().Add(
                        CreateEntry(entry, AuditAction.Deleted, Snapshot(entry, original: true), state.OccurredOnUtc));
                    break;
            }
        }

        if (state.Pending.Count == 0 ||
            !context.Database.IsRelational() ||
            context.Database.CurrentTransaction is not null)
        {
            return null;
        }

        state.OwnsTransaction = true;
        return context;
    }

    private (DbContext Context, SaveState State)? TakePendingCreations(DbContext? context)
    {
        if (context is null || !_states.TryGetValue(context, out var state) || state.Flushing)
            return null;

        if (state.Pending.Count == 0)
            return null;

        var rows = state.Pending
            .Select(entry => CreateEntry(entry, AuditAction.Created, Snapshot(entry, original: false), state.OccurredOnUtc))
            .ToList();
        state.Pending.Clear();
        context.Set<AuditTrailEntry>().AddRange(rows);
        state.Flushing = true;
        return (context, state);
    }

    private static void EndFlush(DbContext context, SaveState state)
    {
        state.Flushing = false;
        if (state.OwnsTransaction)
        {
            context.Database.CurrentTransaction?.Dispose();
            state.OwnsTransaction = false;
        }
    }

    private void AbandonSave(DbContext? context)
    {
        if (context is null || !_states.TryGetValue(context, out var state) || state.Flushing)
            return;

        state.Pending.Clear();

        // Audit rows staged for updates/deletes belong to the failed save; drop them so
        // a retry on the same context does not record the change twice.
        foreach (var staged in context.ChangeTracker.Entries<AuditTrailEntry>()
                     .Where(item => item.State == EntityState.Added)
                     .ToList())
        {
            staged.State = EntityState.Detached;
        }

        if (!state.OwnsTransaction)
            return;

        state.OwnsTransaction = false;
        var transaction = context.Database.CurrentTransaction;
        if (transaction is null)
            return;

        try
        {
            transaction.Rollback();
        }
        finally
        {
            transaction.Dispose();
        }
    }

    private static bool IsAudited(EntityEntry entry) =>
        entry.Entity is IAuditedEntity &&
        entry.State is EntityState.Added or EntityState.Modified or EntityState.Deleted &&
        !entry.Metadata.IsOwned() &&
        !entry.Metadata.ClrType.IsDefined(typeof(AuditIgnoreAttribute), inherit: true);

    private AuditTrailEntry? CaptureModified(EntityEntry entry, DateTime occurredOnUtc)
    {
        var action = AuditAction.Modified;
        if (entry.Metadata.FindProperty("IsDeleted") is { } deletedFlag &&
            deletedFlag.ClrType == typeof(bool))
        {
            var flag = entry.Property(deletedFlag.Name);
            var wasDeleted = flag.OriginalValue is true;
            var isDeleted = flag.CurrentValue is true;
            if (!wasDeleted && isDeleted)
                action = AuditAction.Deleted;
            else if (wasDeleted && !isDeleted)
                action = AuditAction.Restored;
        }

        if (action == AuditAction.Deleted)
            return CreateEntry(entry, action, Snapshot(entry, original: true), occurredOnUtc);

        var changes = new List<AuditFieldChange>();
        foreach (var property in entry.Properties.Where(ShouldCapture))
        {
            if (!property.IsModified || Equals(property.OriginalValue, property.CurrentValue))
                continue;
            changes.Add(new AuditFieldChange(
                property.Metadata.Name,
                Format(property.OriginalValue),
                Format(property.CurrentValue)));
        }

        return action == AuditAction.Modified && changes.Count == 0
            ? null
            : CreateEntry(entry, action, changes, occurredOnUtc);
    }

    private static List<AuditFieldChange> Snapshot(EntityEntry entry, bool original)
    {
        var changes = new List<AuditFieldChange>();
        foreach (var property in entry.Properties.Where(ShouldCapture))
        {
            var value = Format(original ? property.OriginalValue : property.CurrentValue);
            if (value is null)
                continue;
            changes.Add(original
                ? new AuditFieldChange(property.Metadata.Name, value, null)
                : new AuditFieldChange(property.Metadata.Name, null, value));
        }

        return changes;
    }

    private AuditTrailEntry CreateEntry(
        EntityEntry entry,
        AuditAction action,
        IReadOnlyList<AuditFieldChange> changes,
        DateTime occurredOnUtc)
    {
        var useOriginal = action == AuditAction.Deleted;
        var tenantId = entry.Entity is ITenantScoped tenantScoped && !string.IsNullOrWhiteSpace(tenantScoped.TenantId)
            ? tenantScoped.TenantId
            : _executionContext?.TenantId;
        int? companyId = entry.Entity is ICompanyScoped companyScoped && companyScoped.CompanyId > 0
            ? companyScoped.CompanyId
            : null;

        return new AuditTrailEntry
        {
            TenantId = Truncate(tenantId, AuditTrailModelBuilderExtensions.TenantIdMaxLength),
            CompanyId = companyId,
            EntityName = Truncate(entry.Metadata.ClrType.Name, AuditTrailModelBuilderExtensions.EntityNameMaxLength)!,
            EntityKey = Truncate(KeyOf(entry), AuditTrailModelBuilderExtensions.EntityKeyMaxLength)!,
            EntityDisplay = Truncate(DisplayOf(entry, useOriginal), AuditTrailModelBuilderExtensions.EntityDisplayMaxLength),
            Action = action,
            UserId = Truncate(_executionContext?.UserId, AuditTrailModelBuilderExtensions.UserIdMaxLength),
            OccurredOnUtc = occurredOnUtc,
            CorrelationId = Truncate(_executionContext?.CorrelationId, AuditTrailModelBuilderExtensions.CorrelationIdMaxLength),
            ChangeCount = changes.Count,
            ChangesJson = JsonSerializer.Serialize(changes, JsonOptions)
        };
    }

    private static bool ShouldCapture(PropertyEntry property)
    {
        var metadata = property.Metadata;
        if (metadata.IsPrimaryKey() || metadata.IsConcurrencyToken || metadata.ClrType == typeof(byte[]))
            return false;

        var name = metadata.Name;
        if (ExcludedProperties.Contains(name) ||
            SensitiveNameFragments.Any(fragment => name.Contains(fragment, StringComparison.OrdinalIgnoreCase)))
        {
            return false;
        }

        return metadata.PropertyInfo?.IsDefined(typeof(AuditIgnoreAttribute), inherit: true) != true;
    }

    private static string KeyOf(EntityEntry entry)
    {
        var key = entry.Metadata.FindPrimaryKey();
        if (key is null)
            return string.Empty;

        return string.Join(
            "|",
            key.Properties.Select(property => Format(entry.Property(property.Name).CurrentValue) ?? string.Empty));
    }

    private static string? DisplayOf(EntityEntry entry, bool useOriginal)
    {
        foreach (var name in DisplayProperties)
        {
            if (entry.Metadata.FindProperty(name) is not { } property || property.ClrType != typeof(string))
                continue;

            var propertyEntry = entry.Property(name);
            var value = (useOriginal ? propertyEntry.OriginalValue : propertyEntry.CurrentValue) as string;
            if (!string.IsNullOrWhiteSpace(value))
                return value.Trim();
        }

        return null;
    }

    private static string? Format(object? value) => value switch
    {
        null => null,
        string text => Truncate(text, MaxValueLength),
        bool flag => flag ? "true" : "false",
        DateTime dateTime => dateTime.ToString("O", CultureInfo.InvariantCulture),
        DateTimeOffset dateTimeOffset => dateTimeOffset.ToString("O", CultureInfo.InvariantCulture),
        DateOnly date => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
        TimeOnly time => time.ToString("HH:mm:ss", CultureInfo.InvariantCulture),
        Enum enumValue => enumValue.ToString(),
        IFormattable formattable => formattable.ToString(null, CultureInfo.InvariantCulture),
        _ => Truncate(value.ToString(), MaxValueLength)
    };

    private static string? Truncate(string? value, int maxLength) =>
        value is null || value.Length <= maxLength ? value : value[..maxLength];

    private sealed class SaveState
    {
        public List<EntityEntry> Pending { get; } = [];
        public bool Flushing { get; set; }
        public bool OwnsTransaction { get; set; }
        public DateTime OccurredOnUtc { get; set; }
    }
}
