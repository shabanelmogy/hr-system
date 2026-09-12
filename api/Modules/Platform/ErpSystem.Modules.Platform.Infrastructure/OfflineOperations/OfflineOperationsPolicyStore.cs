using System.Text.Json;
using ErpSystem.Modules.Platform.Contracts.OfflineOperations;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace ErpSystem.Modules.Platform.Infrastructure.OfflineOperations;

internal sealed class OfflineOperationsPolicyStore(PlatformDbContext db)
    : IOfflineOperationsPolicyStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public async Task<OfflineOperationsPolicyStoreRecord?> GetAsync(
        string tenantId,
        int companyId,
        CancellationToken cancellationToken = default)
    {
        var row = await db.Set<OfflineOperationsPolicyRow>()
            .AsNoTracking()
            .SingleOrDefaultAsync(
                candidate => candidate.TenantId == tenantId && candidate.CompanyId == companyId,
                cancellationToken)
            .ConfigureAwait(false);

        return row is null ? null : ToRecord(row);
    }

    public async Task<OfflineOperationsPolicyStoreRecord> SaveAsync(
        SaveOfflineOperationsPolicyRequest request,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(request);

        var policies = db.Set<OfflineOperationsPolicyRow>();
        var existing = await policies.SingleOrDefaultAsync(
            candidate => candidate.TenantId == request.TenantId &&
                         candidate.CompanyId == request.CompanyId,
            cancellationToken).ConfigureAwait(false);

        var newModesJson = SerializeModes(request.Modes);
        if (existing is null)
        {
            if (request.ExpectedRowVersion is not null)
            {
                throw new OfflineOperationsPolicyConflictException(
                    "The offline operations policy changed before it could be created.");
            }

            var created = new OfflineOperationsPolicyRow
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                CompanyId = request.CompanyId,
                ModesJson = newModesJson,
                UpdatedOn = request.UpdatedOn,
                UpdatedByUserId = request.UpdatedByUserId
            };
            policies.Add(created);
            AddHistory(created, previousModesJson: null, newModesJson, request);

            try
            {
                await db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
            }
            catch (DbUpdateException exception) when (IsUniqueConstraintViolation(exception))
            {
                throw new OfflineOperationsPolicyConflictException(
                    "The offline operations policy was created by another request. Refresh and retry.");
            }

            return ToRecord(created);
        }

        if (request.ExpectedRowVersion is null ||
            !existing.RowVersion.AsSpan().SequenceEqual(request.ExpectedRowVersion))
        {
            throw new OfflineOperationsPolicyConflictException(
                "The offline operations policy changed. Refresh and retry.");
        }

        var previousModesJson = existing.ModesJson;
        db.Entry(existing).Property(row => row.RowVersion).OriginalValue = request.ExpectedRowVersion;
        existing.ModesJson = newModesJson;
        existing.UpdatedOn = request.UpdatedOn;
        existing.UpdatedByUserId = request.UpdatedByUserId;
        AddHistory(existing, previousModesJson, newModesJson, request);

        try
        {
            await db.SaveChangesAsync(cancellationToken).ConfigureAwait(false);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new OfflineOperationsPolicyConflictException(
                "The offline operations policy changed. Refresh and retry.");
        }

        return ToRecord(existing);
    }

    private void AddHistory(
        OfflineOperationsPolicyRow policy,
        string? previousModesJson,
        string newModesJson,
        SaveOfflineOperationsPolicyRequest request)
    {
        db.Set<OfflineOperationsPolicyHistoryRow>().Add(new OfflineOperationsPolicyHistoryRow
        {
            Id = Guid.NewGuid(),
            PolicyId = policy.Id,
            TenantId = request.TenantId,
            CompanyId = request.CompanyId,
            PreviousModesJson = previousModesJson,
            NewModesJson = newModesJson,
            ChangedOn = request.UpdatedOn,
            ChangedByUserId = request.UpdatedByUserId
        });
    }

    private static OfflineOperationsPolicyStoreRecord ToRecord(OfflineOperationsPolicyRow row) =>
        new(
            row.TenantId,
            row.CompanyId,
            DeserializeModes(row.ModesJson),
            row.RowVersion.ToArray(),
            row.UpdatedOn,
            row.UpdatedByUserId);

    private static string SerializeModes(IReadOnlyDictionary<string, string> modes) =>
        JsonSerializer.Serialize(modes, JsonOptions);

    private static IReadOnlyDictionary<string, string> DeserializeModes(string json)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(json, JsonOptions)
                ?? new Dictionary<string, string>(StringComparer.Ordinal);
        }
        catch (JsonException)
        {
            return new Dictionary<string, string>(StringComparer.Ordinal);
        }
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException exception) =>
        exception.InnerException is SqlException { Number: 2601 or 2627 };
}
