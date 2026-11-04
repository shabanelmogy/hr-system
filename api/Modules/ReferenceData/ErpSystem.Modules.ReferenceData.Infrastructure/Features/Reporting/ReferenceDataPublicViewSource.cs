using System.Data;
using System.Data.Common;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using ErpSystem.Modules.ReferenceData.Contracts.Reporting;

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Features.Reporting;

public sealed partial class ReferenceDataPublicViewSource(ReferenceDataDbContext context) : IReferenceDataPublicViewSource
{
    [GeneratedRegex("^[A-Za-z_][A-Za-z0-9_]{0,127}\\.[A-Za-z_][A-Za-z0-9_]{0,127}$", RegexOptions.CultureInvariant)]
    private static partial Regex ViewNamePattern();

    private const string ApprovedDependencies = """
        EXISTS (SELECT 1 FROM sys.sql_expression_dependencies d WHERE d.referencing_id=v.object_id)
        AND NOT EXISTS (
            SELECT 1 FROM sys.sql_expression_dependencies d
            LEFT JOIN sys.tables t ON t.object_id=d.referenced_id
            WHERE d.referencing_id=v.object_id AND (
                d.referenced_class<>1 OR (@requireBound=1 AND d.is_schema_bound_reference<>1) OR t.object_id IS NULL OR
                SCHEMA_NAME(t.schema_id)<>'ref' OR t.name NOT IN ('Countries','States','Districts') OR
                (@source<>'districts' AND t.name='Districts') OR
                d.referenced_server_name IS NOT NULL OR d.referenced_database_name IS NOT NULL))
        """;

    public async Task<ReferencePublicViewPage?> ListAsync(string sourceKey, string? search, int page, int pageSize,
        CancellationToken cancellationToken)
    {
        if (sourceKey is not ("countries" or "states" or "districts") || search?.Length > 200) return null;
        var connection = context.Database.GetDbConnection();
        var openedHere = connection.State != ConnectionState.Open;
        try
        {
            if (openedHere) await context.Database.OpenConnectionAsync(cancellationToken);
            var filter = " FROM sys.views v JOIN sys.schemas s ON s.schema_id=v.schema_id " +
                "JOIN sys.sql_modules m ON m.object_id=v.object_id WHERE " + ApprovedDependencies +
                " AND (@search='' OR CHARINDEX(@search,s.name+'.'+v.name)>0)";
            using var count = Command(connection, "SELECT COUNT(*)" + filter);
            DiscoveryParameters(count, sourceKey, search);
            var total = Convert.ToInt32(await count.ExecuteScalarAsync(cancellationToken), CultureInfo.InvariantCulture);
            using var listing = Command(connection, "SELECT s.name+'.'+v.name,m.is_schema_bound" + filter +
                " ORDER BY s.name,v.name,v.object_id OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY");
            DiscoveryParameters(listing, sourceKey, search);
            var limit = Math.Clamp(pageSize, 1, 50);
            Parameter(listing, "@offset", (Math.Clamp(page, 1, 100000) - 1) * limit);
            Parameter(listing, "@limit", limit);
            var items = new List<ReferencePublicViewName>();
            using var reader = await listing.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken)) items.Add(new(reader.GetString(0), reader.GetBoolean(1)));
            return new(items, total);
        }
        catch (DbException) { return null; }
        finally { if (openedHere) await context.Database.CloseConnectionAsync(); }
    }

    private static void DiscoveryParameters(DbCommand command, string sourceKey, string? search)
    {
        Parameter(command, "@source", sourceKey);
        Parameter(command, "@search", search?.Trim() ?? "");
        Parameter(command, "@requireBound", 0);
    }

    public async Task<ReferencePublicViewData?> ReadAsync(string viewName, string sourceKey, int maximumRows,
        IReadOnlyDictionary<string, string?> columnFilters, CancellationToken cancellationToken,
        IReadOnlyList<string>? selectedColumns = null)
    {
        if (!ViewNamePattern().IsMatch(viewName) || maximumRows is < 0 or > 10001 ||
            sourceKey is not ("countries" or "states" or "districts")) return null;
        var connection = context.Database.GetDbConnection();
        var openedHere = connection.State != ConnectionState.Open;
        try
        {
            if (openedHere) await context.Database.OpenConnectionAsync(cancellationToken);
            using var metadata = Command(connection, """
                SELECT m.definition FROM sys.views v
                JOIN sys.sql_modules m ON m.object_id=v.object_id
                WHERE v.object_id=OBJECT_ID(@view, 'V') AND m.is_schema_bound=1
                """ + " AND " + ApprovedDependencies);
            Parameter(metadata, "@view", viewName);
            Parameter(metadata, "@source", sourceKey);
            Parameter(metadata, "@requireBound", 1);
            var definition = await metadata.ExecuteScalarAsync(cancellationToken) as string;
            if (string.IsNullOrWhiteSpace(definition)) return null;

            var columns = new List<ReferencePublicViewColumn>();
            using (var schema = Command(connection, """
                SELECT c.name, TYPE_NAME(c.system_type_id), c.is_nullable, c.max_length
                FROM sys.columns c WHERE c.object_id=OBJECT_ID(@view, 'V') ORDER BY c.column_id
                """))
            {
                Parameter(schema, "@view", viewName);
                using var reader = await schema.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    var name = reader.GetString(0);
                    var sqlType = reader.GetString(1);
                    var type = sqlType switch
                    {
                        "int" => "int32",
                        "nvarchar" or "varchar" or "nchar" or "char" when reader.GetInt16(3) >= 0 => "string",
                        _ => "sql:" + sqlType
                    };
                    if (columns.Count >= 256) return null;
                    columns.Add(new(name, type, reader.GetBoolean(2)));
                }
            }
            var companyCount = sourceKey == "districts" && !columns.Any(column => column.Name == "AddressesCount");
            if (companyCount) columns.Add(new("AddressesCount", "int32", false));
            if (columns.Count == 0 || columnFilters.Any(filter =>
                !columns.Any(column => column.Name == filter.Key && column.Type == "string") || filter.Value?.Length > 200)) return null;
            var fingerprint = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(definition + "\n" +
                string.Join("\n", columns.Select(column => $"{column.Name}|{column.Type}|{column.Nullable}"))))).ToLowerInvariant();
            var rows = new List<object?[]>();
            if (maximumRows > 0)
            {
                var requested = selectedColumns ?? columns.Where(column => column.Type is "int32" or "string")
                    .Select(column => column.Name).ToArray();
                if (requested.Count == 0 || requested.Count > 256 || requested.Distinct(StringComparer.Ordinal).Count() != requested.Count)
                    return null;
                var projection = new List<ReferencePublicViewColumn>();
                foreach (var name in requested)
                {
                    var column = columns.FirstOrDefault(item => item.Name == name && item.Type is "int32" or "string");
                    if (column is null) return null;
                    projection.Add(column);
                }
                columns = projection;
                var populateCount = companyCount && columns.Any(column => column.Name == "AddressesCount");
                if (populateCount && !columns.Any(column => column.Name == "DistrictId" && column.Type == "int32" && !column.Nullable)) return null;
                var parts = viewName.Split('.');
                var sqlColumns = columns.Where(column => !populateCount || column.Name != "AddressesCount").ToArray();
                var fields = string.Join(",", sqlColumns.Select(column => "[" + column.Name.Replace("]", "]]", StringComparison.Ordinal) + "]"));
                var filters = columnFilters.Where(filter => filter.Value is not null).ToArray();
                var conditions = filters.Select((filter, index) => "[" + filter.Key.Replace("]", "]]", StringComparison.Ordinal) + "]=@p" + index.ToString(CultureInfo.InvariantCulture));
                using var query = Command(connection, $"SELECT TOP (@limit) {fields} FROM [{parts[0]}].[{parts[1]}]" +
                    (filters.Length == 0 ? "" : " WHERE " + string.Join(" AND ", conditions)) + " ORDER BY " + fields);
                Parameter(query, "@limit", maximumRows);
                for (var index = 0; index < filters.Length; index++)
                    Parameter(query, "@p" + index.ToString(CultureInfo.InvariantCulture), filters[index].Value);
                using (var reader = await query.ExecuteReaderAsync(cancellationToken))
                {
                    while (await reader.ReadAsync(cancellationToken))
                    {
                        var values = new object?[columns.Count];
                        var ordinal = 0;
                        for (var index = 0; index < columns.Count; index++)
                        {
                            if (populateCount && columns[index].Name == "AddressesCount") continue;
                            var value = reader.GetValue(ordinal++);
                            values[index] = value == DBNull.Value ? null : value;
                        }
                        rows.Add(values);
                    }
                }
                if (populateCount) await PopulateCompanyAddressCountsAsync(columns, rows, cancellationToken);
            }
            // Reject a DDL change between metadata inspection and buffered execution.
            if (!Equals(definition, await metadata.ExecuteScalarAsync(cancellationToken))) return null;
            return new(viewName, fingerprint, columns, rows);
        }
        catch (DbException) { return null; }
        finally { if (openedHere) await context.Database.CloseConnectionAsync(); }
    }

    private async Task PopulateCompanyAddressCountsAsync(List<ReferencePublicViewColumn> columns,
        List<object?[]> rows, CancellationToken cancellationToken)
    {
        var idIndex = columns.FindIndex(column => column.Name == "DistrictId");
        var countIndex = columns.FindIndex(column => column.Name == "AddressesCount");
        var ids = rows.Select(row => (int)row[idIndex]!).Distinct().ToArray();
        var counts = new Dictionary<int, int>();
        foreach (var batch in ids.Chunk(500))
        {
            // ReferenceData's mandatory query filters supply the trusted tenant/company.
            var scoped = await context.Addresses.AsNoTracking()
                .Where(address => address.DistrictId.HasValue && batch.Contains(address.DistrictId.Value))
                .GroupBy(address => address.DistrictId)
                .Select(group => new { Id = group.Key!.Value, Count = group.Count() })
                .ToArrayAsync(cancellationToken);
            foreach (var item in scoped) counts[item.Id] = item.Count;
        }
        foreach (var row in rows) row[countIndex] = counts.GetValueOrDefault((int)row[idIndex]!);
    }

    private static DbCommand Command(DbConnection connection, string text)
    {
        var command = connection.CreateCommand();
        command.CommandText = text;
        command.CommandTimeout = 15;
        return command;
    }
    private static void Parameter(DbCommand command, string name, object? value)
    {
        var parameter = command.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value ?? DBNull.Value;
        command.Parameters.Add(parameter);
    }
}
