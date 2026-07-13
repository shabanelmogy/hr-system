using System.Collections;
using HrManagementSystem.Features.Platform.EntityChangeLogs.Contracts;
using Newtonsoft.Json;

namespace HrManagementSystem.Features.Platform.EntityChangeLogs.Services;

public class EntityChangeLogService : IEntityChangeLogService
{
    private readonly ApplicationDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public EntityChangeLogService(ApplicationDbContext context, IHttpContextAccessor httpContextAccessor)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _httpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    public async Task<EntityChangeLogsRequest?> CreateChangeLogAsync<TEntity>(int entityId, TEntity existingEntity, TEntity updatedEntity) where TEntity : class
    {
        if (existingEntity == null || updatedEntity == null)
        {
            throw new ArgumentNullException(nameof(existingEntity), "Entities cannot be null");
        }

        var entityName = typeof(TEntity).Name;
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
            EntityName = entityName,
            JsonOldValues = oldValuesJson,
            JsonNewValues = newValuesJson,
            ChangedById = _httpContextAccessor.HttpContext?.User.GetUserId()
                ?? throw new InvalidOperationException("User is not authenticated"),
            ChangedByPc = Environment.MachineName
        };

        var changeLogResponse = changeLog.Adapt<EntityChangeLog>();
        _context.Set<EntityChangeLog>().Add(changeLogResponse);
        await _context.SaveChangesAsync();

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
                           log.EntityId,
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
            var dictionary = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            return dictionary?.ToList() ?? new List<KeyValuePair<string, string>>();
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
