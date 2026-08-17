using HrManagementSystem.Application.Abstractions.Authentication;
using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Services;
using System.Collections;
using System.Globalization;
using HrManagementSystem.Application.Features.Platform.EntityChangeLogs.Contracts;
using Newtonsoft.Json;

using HrManagementSystem.Domain.Platform.EntityChangeLogs.Entities;

namespace HrManagementSystem.Infrastructure.Features.Platform.EntityChangeLogs.Services;

public class EntityChangeLogService : IEntityChangeLogService
{
    private readonly ApplicationDbContext _context;
    private readonly ICurrentActor _currentActor;
    private readonly TimeProvider _timeProvider;

    public EntityChangeLogService(
        ApplicationDbContext context,
        ICurrentActor currentActor,
        TimeProvider timeProvider)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _currentActor = currentActor ?? throw new ArgumentNullException(nameof(currentActor));
        _timeProvider = timeProvider ?? throw new ArgumentNullException(nameof(timeProvider));
    }

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
            cancellationToken);
    }

    private async Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(
        int entityId,
        string? entityKey,
        string entityName,
        TEntity existingEntity,
        TEntity updatedEntity,
        CancellationToken cancellationToken)
        where TEntity : class
    {
        if (existingEntity is null || updatedEntity is null)
        {
            throw new ArgumentNullException(nameof(existingEntity), "Entities cannot be null");
        }

        var oldValuesJson = GetValuesAsJson(existingEntity, updatedEntity, true);
        var newValuesJson = GetValuesAsJson(existingEntity, updatedEntity, false);

        // Return null if no changes are detected
        if (string.IsNullOrEmpty(oldValuesJson) && string.IsNullOrEmpty(newValuesJson))
        {
            return null;
        }

        var changeLog = new EntityChangeLogsRequest
        {
            EntityId = entityId,
            EntityKey = entityKey,
            EntityName = entityName,
            JsonOldValues = oldValuesJson,
            JsonNewValues = newValuesJson,
            ChangedById = _currentActor.UserId
                ?? throw new InvalidOperationException("User is not authenticated"),
            ChangedByPc = Environment.MachineName
        };

        var changeLogResponse = changeLog.Adapt<EntityChangeLog>();
        changeLogResponse.ChangedAt = _timeProvider.GetUtcNow().UtcDateTime;
        _context.Set<EntityChangeLog>().Add(changeLogResponse);
        await _context.SaveChangesAsync(cancellationToken);

        return changeLog;
    }

    public async Task<List<EntityChangeLogsResponse>> GetChangeLogKeyValuesAsync()
    {
        // Fetch raw logs from the database
        var rawLogs = await (from log in _context.EntityChangeLogs.AsNoTracking()
                             join user in _context.Users.AsNoTracking()
                             on log.ChangedById equals user.Id into userGroup
                             from user in userGroup.DefaultIfEmpty()
                             select new
                             {
                                 log.EntityId,
                                 log.EntityKey,
                                 log.EntityName,
                                 log.JsonOldValues,
                                 log.JsonNewValues,
                                 log.ChangedAt,
                                 log.ChangedByPc,
                                 UserName = user != null ? user.UserName : "Unknown User"
                             }).ToListAsync();

        // Process JSON fields in memory
        var result = rawLogs
            .SelectMany(log =>
            {
                var oldValues = ParseJson(log.JsonOldValues ?? string.Empty);
                var newValues = ParseJson(log.JsonNewValues ?? string.Empty);

                return from oldValue in oldValues
                       join newValue in newValues
                       on oldValue.Key equals newValue.Key
                       select new EntityChangeLogsResponse
                       (
                           log.EntityKey ?? log.EntityId.ToString(CultureInfo.InvariantCulture),
                           log.EntityName ?? string.Empty,
                           oldValue.Key,
                           oldValue.Value ?? string.Empty,
                           newValue.Value ?? string.Empty,
                           log.UserName,
                           log.ChangedAt,
                           log.ChangedByPc ?? string.Empty
                       );
            })
            .ToList();

        return result;
    }

    // Helper method to parse JSON into key-value pairs
    private static List<KeyValuePair<string, string>> ParseJson(string json)
    {
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<KeyValuePair<string, string>>();
        }

        try
        {
            using var document = System.Text.Json.JsonDocument.Parse(json);
            if (document.RootElement.ValueKind != System.Text.Json.JsonValueKind.Object)
                return [];

            return document.RootElement
                .EnumerateObject()
                .Select(property => new KeyValuePair<string, string>(
                    property.Name,
                    property.Value.ValueKind switch
                    {
                        System.Text.Json.JsonValueKind.String => property.Value.GetString() ?? string.Empty,
                        System.Text.Json.JsonValueKind.Null => string.Empty,
                        _ => property.Value.GetRawText()
                    }))
                .ToList();
        }
        catch (System.Text.Json.JsonException ex)
        {
            Console.WriteLine($"Failed to parse JSON: {ex.Message}");
            return new List<KeyValuePair<string, string>>();
        }
    }

    // Helper method to get changed values as JSON, excluding navigation properties
    private static string? GetValuesAsJson<TEntity>(TEntity existingEntity, TEntity updatedEntity, bool forOldValues) where TEntity : class
    {
        var differences = new Dictionary<string, object?>();
        var properties = typeof(TEntity).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var property in properties)
        {
            // Skip non-tracked properties and navigation properties
            if (!IsTrackableProperty(property))
            {
                continue;
            }

            var oldValue = property.GetValue(existingEntity);
            var newValue = property.GetValue(updatedEntity);

            // Handle null or empty new values
            if (newValue == null || newValue is string strValue && string.IsNullOrWhiteSpace(strValue))
            {
                if (oldValue != null && !(oldValue is string oldStr && string.IsNullOrWhiteSpace(oldStr)))
                {
                    differences[property.Name] = forOldValues ? oldValue : newValue;
                }
                continue;
            }

            // Log differences
            if (!Equals(oldValue, newValue))
            {
                differences[property.Name] = forOldValues ? oldValue : newValue;
            }
        }

        return differences.Count > 0 ? JsonConvert.SerializeObject(differences) : null;
    }

    // Helper method to determine if a property should be tracked
    private static bool IsTrackableProperty(PropertyInfo property)
    {
        // Skip if it can't be read or is an ignored property
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

        // Exclude strings from being treated as navigation properties
        if (propertyType == typeof(string))
        {
            return true;
        }

        // Exclude collections (e.g., List<T>, IEnumerable<T>) except byte[]
        if (typeof(IEnumerable).IsAssignableFrom(propertyType) && propertyType != typeof(byte[]))
        {
            return false;
        }

        // Exclude reference types (classes or interfaces) that aren't value types
        if (propertyType.IsClass || propertyType.IsInterface)
        {
            return false;
        }

        return true;
    }
}
