using System.Collections.ObjectModel;
using System.Data;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Xml;
using ErpSystem.Modules.Reporting.Contracts.Features.Analytics.CrystalReports;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Abstractions;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.CrystalReports.Contracts;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.CrystalReports.Persistence;

public sealed class ManagedCrystalReportContractRegistry : IManagedCrystalReportContractSource
{
    public const int SupportedSchemaVersion = 1;

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = false,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow
    };

    private static readonly Regex EntityKeyPattern = new(
        "^[a-z0-9]+(?:-[a-z0-9]+)*$",
        RegexOptions.CultureInvariant | RegexOptions.Compiled);

    private readonly IReadOnlyDictionary<string, ManagedCrystalReportEntityContract> _entities;

    private ManagedCrystalReportContractRegistry(
        int schemaVersion,
        string fingerprint,
        IReadOnlyDictionary<string, ManagedCrystalReportEntityContract> entities)
    {
        SchemaVersion = schemaVersion;
        Fingerprint = fingerprint;
        _entities = entities;
    }

    public int SchemaVersion { get; }
    public string Fingerprint { get; }
    public int Count => _entities.Count;
    public IReadOnlyCollection<ManagedCrystalReportEntityContract> Entities =>
        _entities.Values.ToArray();
    public IReadOnlyCollection<ManagedCrystalReportEntityDescriptor> EntityDescriptors =>
        _entities.Values
            .OrderBy(entity => entity.EntityKey, StringComparer.Ordinal)
            .Select(entity => new ManagedCrystalReportEntityDescriptor(
                entity.EntityKey,
                entity.Scope,
                entity.Filters.ToArray()))
            .ToArray();

    public static ManagedCrystalReportContractRegistry LoadEmbedded() =>
        Load(ManagedCrystalReportContractArtifact.ReadAllBytes());

    public static ManagedCrystalReportContractRegistry Load(byte[] artifactBytes)
    {
        ArgumentNullException.ThrowIfNull(artifactBytes);
        if (artifactBytes.Length == 0)
            throw new InvalidDataException("The managed Crystal report contract artifact is empty.");

        ManagedCrystalReportDocumentDto document;
        try
        {
            document = JsonSerializer.Deserialize<ManagedCrystalReportDocumentDto>(
                artifactBytes,
                SerializerOptions) ?? throw new InvalidDataException(
                    "The managed Crystal report contract artifact is empty.");
        }
        catch (JsonException exception)
        {
            throw new InvalidDataException(
                "The managed Crystal report contract artifact is not valid JSON.",
                exception);
        }

        if (document.SchemaVersion != SupportedSchemaVersion)
        {
            throw new InvalidDataException(
                $"Unsupported managed Crystal report contract schema version '{document.SchemaVersion}'.");
        }

        if (document.Entities is null || document.Entities.Count == 0)
            throw new InvalidDataException("At least one managed Crystal report entity is required.");

        var entities = new Dictionary<string, ManagedCrystalReportEntityContract>(
            StringComparer.OrdinalIgnoreCase);
        foreach (var entity in document.Entities)
        {
            var profile = CreateEntityContract(entity);
            if (!entities.TryAdd(profile.EntityKey, profile))
            {
                throw new InvalidDataException(
                    $"Duplicate managed Crystal report entity key '{profile.EntityKey}'.");
            }
        }

        var fingerprint = Convert.ToHexString(SHA256.HashData(artifactBytes))
            .ToLowerInvariant();
        return new ManagedCrystalReportContractRegistry(
            document.SchemaVersion,
            fingerprint,
            new ReadOnlyDictionary<string, ManagedCrystalReportEntityContract>(entities));
    }

    public ManagedCrystalReportEntityContract GetRequired(string entityKey)
    {
        if (string.IsNullOrWhiteSpace(entityKey) ||
            !_entities.TryGetValue(entityKey.Trim(), out var profile))
        {
            throw new KeyNotFoundException(
                "The report entity does not have an approved managed Crystal contract.");
        }

        return profile;
    }

    public bool Supports(string entityKey) =>
        !string.IsNullOrWhiteSpace(entityKey) && _entities.ContainsKey(entityKey.Trim());

    public void ValidateDataSetXml(string entityKey, string xml)
    {
        if (string.IsNullOrWhiteSpace(xml))
            throw new InvalidDataException("The managed Crystal report dataset is empty.");

        var dataSet = new DataSet();
        var settings = new XmlReaderSettings
        {
            DtdProcessing = DtdProcessing.Prohibit,
            XmlResolver = null
        };
        using var text = new StringReader(xml);
        using var reader = XmlReader.Create(text, settings);
        dataSet.ReadXml(reader, XmlReadMode.ReadSchema);

        if (dataSet.Tables.Count != 1)
        {
            throw new InvalidDataException(
                "The managed Crystal report dataset must contain exactly one table.");
        }

        ValidateDataTable(GetRequired(entityKey), dataSet.Tables[0]);
    }

    public static Type GetClrType(string portableType) => portableType switch
    {
        "int32" => typeof(int),
        "string" => typeof(string),
        "datetime" => typeof(DateTime),
        _ => throw new InvalidDataException(
            $"Unsupported managed Crystal portable type '{portableType}'.")
    };

    private static ManagedCrystalReportEntityContract CreateEntityContract(
        ManagedCrystalReportEntityDto? entity)
    {
        if (entity is null)
            throw new InvalidDataException("Managed Crystal report entities cannot contain null items.");
        if (string.IsNullOrWhiteSpace(entity.EntityKey) ||
            !EntityKeyPattern.IsMatch(entity.EntityKey))
        {
            throw new InvalidDataException(
                $"Managed Crystal report entity key '{entity.EntityKey}' is not canonical lowercase.");
        }
        if (entity.Scope is not ("global" or "tenant-company"))
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' has an unsupported scope.");
        if (!IsTrimmedNonEmpty(entity.TableName))
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' requires a table name.");
        if (entity.MaxRows <= 0)
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' requires a positive row limit.");
        if (entity.Columns is null || entity.Columns.Count == 0)
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' requires columns.");
        if (entity.Filters is null || entity.Filters.Count == 0)
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' requires filters.");
        if (entity.Parameters is null || entity.Parameters.Count == 0)
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entity.EntityKey}' requires managed parameters.");

        var columnNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var columns = new List<ManagedCrystalReportColumnContract>(entity.Columns.Count);
        foreach (var column in entity.Columns)
        {
            if (column is null || !IsTrimmedNonEmpty(column.Name))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entity.EntityKey}' has an invalid column name.");
            if (!columnNames.Add(column.Name!))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entity.EntityKey}' has duplicate column '{column.Name}'.");

            _ = GetClrType(column.Type ?? string.Empty);
            columns.Add(new ManagedCrystalReportColumnContract(
                column.Name!,
                column.Type!,
                column.Nullable));
        }

        var filters = ValidateUniqueNames(entity.EntityKey, "filter", entity.Filters);
        var parameterNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var parameters = new List<ManagedCrystalReportParameterContract>(entity.Parameters.Count);
        foreach (var parameter in entity.Parameters)
        {
            if (parameter is null || !IsTrimmedNonEmpty(parameter.Name))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entity.EntityKey}' has an invalid parameter name.");
            if (!parameterNames.Add(parameter.Name!))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entity.EntityKey}' has duplicate parameter '{parameter.Name}'.");
            if (parameter.AllowedValues is null || parameter.AllowedValues.Count == 0)
                throw new InvalidDataException(
                    $"Managed Crystal report parameter '{parameter.Name}' requires allowed values.");

            var allowedValues = ValidateUniqueNames(
                entity.EntityKey,
                $"parameter '{parameter.Name}' allowed value",
                parameter.AllowedValues);
            parameters.Add(new ManagedCrystalReportParameterContract(
                parameter.Name!,
                parameter.Type ?? string.Empty,
                parameter.Required,
                parameter.AllowMultipleValues,
                parameter.DiscreteOnly,
                allowedValues));
        }

        ValidateLanguageParameter(entity.EntityKey, parameters);
        return new ManagedCrystalReportEntityContract(
            entity.EntityKey,
            entity.Scope,
            entity.TableName!,
            entity.MaxRows,
            columns.AsReadOnly(),
            filters,
            parameters.AsReadOnly());
    }

    private static ReadOnlyCollection<string> ValidateUniqueNames(
        string entityKey,
        string itemKind,
        IReadOnlyList<string?> values)
    {
        var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var result = new List<string>(values.Count);
        foreach (var value in values)
        {
            if (!IsTrimmedNonEmpty(value))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entityKey}' has an invalid {itemKind}.");
            if (!names.Add(value!))
                throw new InvalidDataException(
                    $"Managed Crystal report entity '{entityKey}' has duplicate {itemKind} '{value}'.");
            result.Add(value!);
        }

        return result.AsReadOnly();
    }

    private static void ValidateLanguageParameter(
        string entityKey,
        IReadOnlyList<ManagedCrystalReportParameterContract> parameters)
    {
        if (parameters.Count != 1)
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entityKey}' must define only the Language parameter.");

        var language = parameters[0];
        var allowedValues = new HashSet<string>(language.AllowedValues, StringComparer.Ordinal);
        if (!string.Equals(language.Name, "Language", StringComparison.Ordinal) ||
            !string.Equals(language.Type, "string", StringComparison.Ordinal) ||
            !language.Required ||
            language.AllowMultipleValues ||
            !language.DiscreteOnly ||
            allowedValues.Count != 2 ||
            !allowedValues.SetEquals(["ar", "en"]))
        {
            throw new InvalidDataException(
                $"Managed Crystal report entity '{entityKey}' has an invalid Language parameter contract.");
        }
    }

    private static void ValidateDataTable(
        ManagedCrystalReportEntityContract profile,
        DataTable table)
    {
        if (!string.Equals(profile.TableName, table.TableName, StringComparison.Ordinal))
            throw SchemaMismatch(profile.EntityKey, "table name");
        if (profile.Columns.Count != table.Columns.Count)
            throw SchemaMismatch(profile.EntityKey, "column count");

        for (var index = 0; index < profile.Columns.Count; index++)
        {
            var expected = profile.Columns[index];
            var actual = table.Columns[index];
            if (!string.Equals(expected.Name, actual.ColumnName, StringComparison.Ordinal) ||
                GetClrType(expected.Type) != actual.DataType ||
                expected.Nullable != actual.AllowDBNull)
            {
                throw SchemaMismatch(profile.EntityKey, $"column '{expected.Name}'");
            }
        }
    }

    private static InvalidDataException SchemaMismatch(string entityKey, string part) =>
        new($"Managed Crystal report dataset for '{entityKey}' does not match its approved {part} contract.");

    private static bool IsTrimmedNonEmpty(string? value) =>
        !string.IsNullOrWhiteSpace(value) && string.Equals(value, value.Trim(), StringComparison.Ordinal);

    private sealed class ManagedCrystalReportDocumentDto
    {
        [JsonPropertyName("schemaVersion")]
        public required int SchemaVersion { get; init; }

        [JsonPropertyName("entities")]
        public required List<ManagedCrystalReportEntityDto?>? Entities { get; init; }
    }

    private sealed class ManagedCrystalReportEntityDto
    {
        [JsonPropertyName("entityKey")]
        public required string? EntityKey { get; init; }

        [JsonPropertyName("scope")]
        public required string? Scope { get; init; }

        [JsonPropertyName("tableName")]
        public required string? TableName { get; init; }

        [JsonPropertyName("maxRows")]
        public required int MaxRows { get; init; }

        [JsonPropertyName("columns")]
        public required List<ManagedCrystalReportColumnDto?>? Columns { get; init; }

        [JsonPropertyName("filters")]
        public required List<string?>? Filters { get; init; }

        [JsonPropertyName("parameters")]
        public required List<ManagedCrystalReportParameterDto?>? Parameters { get; init; }
    }

    private sealed class ManagedCrystalReportColumnDto
    {
        [JsonPropertyName("name")]
        public required string? Name { get; init; }

        [JsonPropertyName("type")]
        public required string? Type { get; init; }

        [JsonPropertyName("nullable")]
        public required bool Nullable { get; init; }
    }

    private sealed class ManagedCrystalReportParameterDto
    {
        [JsonPropertyName("name")]
        public required string? Name { get; init; }

        [JsonPropertyName("type")]
        public required string? Type { get; init; }

        [JsonPropertyName("required")]
        public required bool Required { get; init; }

        [JsonPropertyName("allowMultipleValues")]
        public required bool AllowMultipleValues { get; init; }

        [JsonPropertyName("discreteOnly")]
        public required bool DiscreteOnly { get; init; }

        [JsonPropertyName("allowedValues")]
        public required List<string?>? AllowedValues { get; init; }
    }
}

public sealed record ManagedCrystalReportEntityContract(
    string EntityKey,
    string Scope,
    string TableName,
    int MaxRows,
    IReadOnlyList<ManagedCrystalReportColumnContract> Columns,
    IReadOnlyList<string> Filters,
    IReadOnlyList<ManagedCrystalReportParameterContract> Parameters);

public sealed record ManagedCrystalReportColumnContract(
    string Name,
    string Type,
    bool Nullable);

public sealed record ManagedCrystalReportParameterContract(
    string Name,
    string Type,
    bool Required,
    bool AllowMultipleValues,
    bool DiscreteOnly,
    IReadOnlyList<string> AllowedValues);
