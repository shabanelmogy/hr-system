using System.Collections;
using System.Globalization;
using System.Reflection;
using System.Text.Json;
using ErpSystem.BuildingBlocks.Context;
using ErpSystem.Modules.Platform.Contracts.EntityChangeLogs;
using Newtonsoft.Json;

namespace ErpSystem.Modules.Platform.Application.EntityChangeLogs;

/// <summary>
/// Canonical cross-module change-log application service. Diff policy,
/// serialization, actor/time capture, and wire projection live here; physical
/// persistence and identity lookup remain behind neutral ports.
/// </summary>
internal sealed class EntityChangeLogService(
    IEntityChangeLogStore store,
    IEntityChangeLogQueryStore queryStore,
    ICurrentExecutionContext currentActor,
    TimeProvider timeProvider) : IEntityChangeLogService
{
    public Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
        int entityId,
        TEntity existingEntity,
        TEntity updatedEntity,
        CancellationToken cancellationToken = default)
        where TEntity : class =>
        CreateChangeLogAsync(
            entityId,
            entityKey: null,
            typeof(TEntity).Name,
            existingEntity,
            updatedEntity,
            typeof(TEntity),
            cancellationToken);

    public Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
        string entityKey,
        string entityName,
        TEntity existingEntity,
        TEntity updatedEntity,
        CancellationToken cancellationToken = default)
        where TEntity : class
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entityKey);
        ArgumentException.ThrowIfNullOrWhiteSpace(entityName);

        return CreateChangeLogAsync(
            entityId: 0,
            entityKey,
            entityName,
            existingEntity,
            updatedEntity,
            typeof(TEntity),
            cancellationToken);
    }

    public Task<EntityChangeLogsRequest?> CreateChangeLogAsync(
        int entityId,
        string entityName,
        object existingEntity,
        object updatedEntity,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entityName);
        if (existingEntity is null || updatedEntity is null)
            throw new ArgumentNullException(nameof(existingEntity), "Entities cannot be null");

        return CreateChangeLogAsync(
            entityId,
            entityKey: null,
            entityName,
            existingEntity,
            updatedEntity,
            existingEntity.GetType(),
            cancellationToken);
    }

    public async Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync()
    {
        var rawLogs = await queryStore.GetAllAsync().ConfigureAwait(false);

        return rawLogs
            .SelectMany(log =>
            {
                var oldValues = ParseJson(log.JsonOldValues ?? string.Empty);
                var newValues = ParseJson(log.JsonNewValues ?? string.Empty);
                var changedBy = log.ChangedByUserExists
                    ? log.ChangedByUserName!
                    : "Unknown User";

                return from oldValue in oldValues
                       join newValue in newValues on oldValue.Key equals newValue.Key
                       select new EntityChangeLogsResponse(
                           log.EntityKey ?? log.EntityId.ToString(CultureInfo.InvariantCulture),
                           log.EntityName ?? string.Empty,
                           oldValue.Key,
                           oldValue.Value ?? string.Empty,
                           newValue.Value ?? string.Empty,
                           changedBy,
                           log.ChangedAt,
                           log.ChangedByPc ?? string.Empty);
            })
            .ToList();
    }

    public async Task<List<EntityChangeLogsResponse>> GetChangeLogsByEntityAsync(
        string entityName,
        int entityId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(entityName);
        var normalizedEntityName = entityName.Trim();
        var rawLogs = await queryStore
            .GetByEntityAsync(normalizedEntityName, entityId, cancellationToken)
            .ConfigureAwait(false);
        var result = new List<EntityChangeLogsResponse>();

        foreach (var log in rawLogs)
        {
            var oldValues = ParseJson(log.JsonOldValues ?? string.Empty);
            var newValues = ParseJson(log.JsonNewValues ?? string.Empty);
            var allKeys = oldValues.Select(value => value.Key)
                .Union(newValues.Select(value => value.Key))
                .Distinct();
            var changedBy = log.ChangedByUserExists
                ? log.ChangedByUserName ?? "User"
                : "System";

            foreach (var key in allKeys)
            {
                var oldValue = oldValues.FirstOrDefault(value => value.Key == key).Value ?? string.Empty;
                var newValue = newValues.FirstOrDefault(value => value.Key == key).Value ?? string.Empty;

                result.Add(new EntityChangeLogsResponse(
                    log.Id.ToString(CultureInfo.InvariantCulture),
                    log.EntityName ?? normalizedEntityName,
                    key,
                    oldValue,
                    newValue,
                    changedBy,
                    log.ChangedAt,
                    log.ChangedByPc ?? string.Empty));
            }
        }

        return result;
    }

    private async Task<EntityChangeLogsRequest?> CreateChangeLogAsync(
        int entityId,
        string? entityKey,
        string entityName,
        object existingEntity,
        object updatedEntity,
        Type entityType,
        CancellationToken cancellationToken)
    {
        if (existingEntity is null || updatedEntity is null)
            throw new ArgumentNullException(nameof(existingEntity), "Entities cannot be null");

        var oldValuesJson = GetValuesAsJson(existingEntity, updatedEntity, entityType, forOldValues: true);
        var newValuesJson = GetValuesAsJson(existingEntity, updatedEntity, entityType, forOldValues: false);
        if (string.IsNullOrEmpty(oldValuesJson) && string.IsNullOrEmpty(newValuesJson))
            return null;

        var changeLog = new EntityChangeLogsRequest
        {
            EntityId = entityId,
            EntityKey = entityKey,
            EntityName = entityName,
            JsonOldValues = oldValuesJson,
            JsonNewValues = newValuesJson,
            ChangedById = currentActor.UserId
                ?? throw new InvalidOperationException("User is not authenticated"),
            ChangedByPc = Environment.MachineName
        };

        await store.AddAsync(
            new EntityChangeLogRecord(
                changeLog.EntityId,
                changeLog.EntityKey,
                changeLog.EntityName,
                changeLog.JsonOldValues,
                changeLog.JsonNewValues,
                changeLog.ChangedById,
                changeLog.ChangedByPc,
                timeProvider.GetUtcNow().UtcDateTime),
            cancellationToken).ConfigureAwait(false);

        return changeLog;
    }

    private static List<KeyValuePair<string, string>> ParseJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];

        try
        {
            using var document = JsonDocument.Parse(json);
            if (document.RootElement.ValueKind != JsonValueKind.Object)
                return [];

            return document.RootElement
                .EnumerateObject()
                .Select(property => new KeyValuePair<string, string>(
                    property.Name,
                    property.Value.ValueKind switch
                    {
                        JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                        JsonValueKind.Null => string.Empty,
                        _ => property.Value.GetRawText()
                    }))
                .ToList();
        }
        catch (System.Text.Json.JsonException exception)
        {
            Console.WriteLine($"Failed to parse JSON: {exception.Message}");
            return [];
        }
    }

    private static string? GetValuesAsJson(
        object existingEntity,
        object updatedEntity,
        Type entityType,
        bool forOldValues)
    {
        var differences = new Dictionary<string, object?>();
        foreach (var property in entityType.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!IsTrackableProperty(property))
                continue;

            var oldValue = property.GetValue(existingEntity);
            var newValue = property.GetValue(updatedEntity);

            if (newValue is null || newValue is string stringValue && string.IsNullOrWhiteSpace(stringValue))
            {
                if (oldValue is not null && !(oldValue is string oldString && string.IsNullOrWhiteSpace(oldString)))
                    differences[property.Name] = forOldValues ? oldValue : newValue;

                continue;
            }

            if (!Equals(oldValue, newValue))
                differences[property.Name] = forOldValues ? oldValue : newValue;
        }

        return differences.Count > 0 ? JsonConvert.SerializeObject(differences) : null;
    }

    private static bool IsTrackableProperty(PropertyInfo property)
    {
        if (!property.CanRead ||
            property.Name.Equals("Id", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("CreatedById", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("CreatedOn", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("CreatedByPc", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("UpdatedById", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("UpdatedOn", StringComparison.OrdinalIgnoreCase) ||
            property.Name.Equals("UpdatedByPc", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var propertyType = property.PropertyType;
        if (propertyType == typeof(string))
            return true;
        if (typeof(IEnumerable).IsAssignableFrom(propertyType) && propertyType != typeof(byte[]))
            return false;
        if (propertyType.IsClass || propertyType.IsInterface)
            return false;

        return true;
    }
}
