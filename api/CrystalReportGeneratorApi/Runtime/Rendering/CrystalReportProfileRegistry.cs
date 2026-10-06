using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

namespace CrystalReportGeneratorApi.Runtime.Rendering
{
    public sealed class CrystalReportProfileRegistry
    {
        public const int SupportedSchemaVersion = 1;

        private static readonly Regex EntityKeyPattern = new Regex(
            "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            RegexOptions.CultureInvariant | RegexOptions.Compiled);

        private readonly IReadOnlyDictionary<string, CrystalReportProfile> _profiles;

        private CrystalReportProfileRegistry(
            int schemaVersion,
            string fingerprint,
            IReadOnlyDictionary<string, CrystalReportProfile> profiles)
        {
            SchemaVersion = schemaVersion;
            Fingerprint = fingerprint;
            _profiles = profiles;
        }

        public int SchemaVersion { get; private set; }
        public string Fingerprint { get; private set; }
        public int Count { get { return _profiles.Count; } }

        public CrystalReportProfile GetRequired(string entityKey)
        {
            CrystalReportProfile profile;
            if (string.IsNullOrWhiteSpace(entityKey) ||
                !_profiles.TryGetValue(entityKey.Trim(), out profile))
            {
                throw new UnsupportedCrystalReportProfileException(
                    "The report entity does not have an approved runtime profile.");
            }

            return profile;
        }

        public static CrystalReportProfileRegistry CreateDefault()
        {
            return Load(ManagedCrystalReportContractArtifact.ReadAllBytes());
        }

        public static CrystalReportProfileRegistry Load(byte[] artifactBytes)
        {
            if (artifactBytes == null)
                throw new ArgumentNullException(nameof(artifactBytes));
            if (artifactBytes.Length == 0)
                throw new InvalidDataException(
                    "The managed Crystal report contract artifact is empty.");

            ManagedCrystalReportDocument document;
            try
            {
                var serializerSettings = new JsonSerializerSettings
                {
                    MissingMemberHandling = MissingMemberHandling.Error,
                    NullValueHandling = NullValueHandling.Include
                };
                document = JsonConvert.DeserializeObject<ManagedCrystalReportDocument>(
                    Encoding.UTF8.GetString(artifactBytes),
                    serializerSettings);
            }
            catch (JsonException exception)
            {
                throw new InvalidDataException(
                    "The managed Crystal report contract artifact is not valid JSON.",
                    exception);
            }

            if (document == null)
                throw new InvalidDataException(
                    "The managed Crystal report contract artifact is empty.");
            if (document.SchemaVersion != SupportedSchemaVersion)
            {
                throw new InvalidDataException(
                    "Unsupported managed Crystal report contract schema version '" +
                    document.SchemaVersion + "'.");
            }
            if (document.Entities == null || document.Entities.Count == 0)
                throw new InvalidDataException(
                    "At least one managed Crystal report entity is required.");

            var profiles = new Dictionary<string, CrystalReportProfile>(
                StringComparer.OrdinalIgnoreCase);
            foreach (var entity in document.Entities)
            {
                var profile = CreateProfile(entity);
                if (profiles.ContainsKey(profile.EntityKey))
                {
                    throw new InvalidDataException(
                        "Duplicate managed Crystal report entity key '" +
                        profile.EntityKey + "'.");
                }

                profiles.Add(profile.EntityKey, profile);
            }

            return new CrystalReportProfileRegistry(
                document.SchemaVersion,
                ComputeFingerprint(artifactBytes),
                new ReadOnlyDictionary<string, CrystalReportProfile>(profiles));
        }

        private static CrystalReportProfile CreateProfile(
            ManagedCrystalReportEntity entity)
        {
            if (entity == null)
                throw new InvalidDataException(
                    "Managed Crystal report entities cannot contain null items.");
            if (string.IsNullOrWhiteSpace(entity.EntityKey) ||
                !EntityKeyPattern.IsMatch(entity.EntityKey))
            {
                throw new InvalidDataException(
                    "Managed Crystal report entity key '" + entity.EntityKey +
                    "' is not canonical lowercase.");
            }
            if (entity.Scope != "global" && entity.Scope != "tenant-company")
                throw InvalidEntity(entity.EntityKey, "scope");
            if (!IsTrimmedNonEmpty(entity.TableName))
                throw InvalidEntity(entity.EntityKey, "table name");
            if (entity.MaxRows <= 0)
                throw InvalidEntity(entity.EntityKey, "row limit");
            if (entity.Columns == null || entity.Columns.Count == 0)
                throw InvalidEntity(entity.EntityKey, "columns");
            if (entity.Filters == null || entity.Filters.Count == 0)
                throw InvalidEntity(entity.EntityKey, "filters");
            if (entity.Parameters == null || entity.Parameters.Count == 0)
                throw InvalidEntity(entity.EntityKey, "managed parameters");

            var columnNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var columns = new List<CrystalReportColumnProfile>();
            foreach (var column in entity.Columns)
            {
                if (column == null || !IsTrimmedNonEmpty(column.Name))
                    throw InvalidEntity(entity.EntityKey, "column name");
                if (!columnNames.Add(column.Name))
                {
                    throw new InvalidDataException(
                        "Managed Crystal report entity '" + entity.EntityKey +
                        "' has duplicate column '" + column.Name + "'.");
                }
                if (column.Type != "int32" &&
                    column.Type != "string" &&
                    column.Type != "datetime")
                {
                    throw InvalidEntity(entity.EntityKey, "column type");
                }

                columns.Add(new CrystalReportColumnProfile(
                    column.Name,
                    column.Type,
                    column.Nullable));
            }

            var filters = ValidateUniqueNames(
                entity.EntityKey,
                "filter",
                entity.Filters);
            var parameterNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var parameters = new List<CrystalReportParameterProfile>();
            foreach (var parameter in entity.Parameters)
            {
                if (parameter == null || !IsTrimmedNonEmpty(parameter.Name))
                    throw InvalidEntity(entity.EntityKey, "parameter name");
                if (!parameterNames.Add(parameter.Name))
                {
                    throw new InvalidDataException(
                        "Managed Crystal report entity '" + entity.EntityKey +
                        "' has duplicate parameter '" + parameter.Name + "'.");
                }
                if (parameter.AllowedValues == null || parameter.AllowedValues.Count == 0)
                    throw InvalidEntity(entity.EntityKey, "parameter allowed values");

                parameters.Add(new CrystalReportParameterProfile(
                    parameter.Name,
                    parameter.Type,
                    parameter.Required,
                    parameter.AllowMultipleValues,
                    parameter.DiscreteOnly,
                    ValidateUniqueNames(
                        entity.EntityKey,
                        "parameter allowed value",
                        parameter.AllowedValues)));
            }

            ValidateLanguageParameter(entity.EntityKey, parameters);
            return new CrystalReportProfile(
                entity.EntityKey,
                entity.Scope,
                entity.TableName,
                entity.MaxRows,
                new ReadOnlyCollection<CrystalReportColumnProfile>(columns),
                filters,
                new ReadOnlyCollection<CrystalReportParameterProfile>(parameters));
        }

        private static IReadOnlyList<string> ValidateUniqueNames(
            string entityKey,
            string itemKind,
            IReadOnlyList<string> values)
        {
            var unique = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var result = new List<string>();
            foreach (var value in values)
            {
                if (!IsTrimmedNonEmpty(value))
                    throw InvalidEntity(entityKey, itemKind);
                if (!unique.Add(value))
                {
                    throw new InvalidDataException(
                        "Managed Crystal report entity '" + entityKey +
                        "' has duplicate " + itemKind + " '" + value + "'.");
                }
                result.Add(value);
            }

            return new ReadOnlyCollection<string>(result);
        }

        private static void ValidateLanguageParameter(
            string entityKey,
            IReadOnlyList<CrystalReportParameterProfile> parameters)
        {
            if (parameters.Count != 1)
                throw InvalidEntity(entityKey, "Language parameter contract");

            var language = parameters[0];
            var values = new HashSet<string>(language.AllowedValues, StringComparer.Ordinal);
            if (language.Name != "Language" ||
                language.Type != "string" ||
                !language.Required ||
                language.AllowMultipleValues ||
                !language.DiscreteOnly ||
                values.Count != 2 ||
                !values.SetEquals(new[] { "ar", "en" }))
            {
                throw InvalidEntity(entityKey, "Language parameter contract");
            }
        }

        private static string ComputeFingerprint(byte[] bytes)
        {
            using (var sha256 = SHA256.Create())
            {
                return BitConverter.ToString(sha256.ComputeHash(bytes))
                    .Replace("-", string.Empty)
                    .ToLowerInvariant();
            }
        }

        private static InvalidDataException InvalidEntity(
            string entityKey,
            string part)
        {
            return new InvalidDataException(
                "Managed Crystal report entity '" + entityKey +
                "' has an invalid " + part + ".");
        }

        private static bool IsTrimmedNonEmpty(string value)
        {
            return !string.IsNullOrWhiteSpace(value) && value == value.Trim();
        }

        private sealed class ManagedCrystalReportDocument
        {
            [JsonProperty("schemaVersion", Required = Newtonsoft.Json.Required.Always)]
            public int SchemaVersion { get; set; }

            [JsonProperty("entities", Required = Newtonsoft.Json.Required.Always)]
            public List<ManagedCrystalReportEntity> Entities { get; set; }
        }

        private sealed class ManagedCrystalReportEntity
        {
            [JsonProperty("entityKey", Required = Newtonsoft.Json.Required.Always)]
            public string EntityKey { get; set; }

            [JsonProperty("scope", Required = Newtonsoft.Json.Required.Always)]
            public string Scope { get; set; }

            [JsonProperty("tableName", Required = Newtonsoft.Json.Required.Always)]
            public string TableName { get; set; }

            [JsonProperty("maxRows", Required = Newtonsoft.Json.Required.Always)]
            public int MaxRows { get; set; }

            [JsonProperty("columns", Required = Newtonsoft.Json.Required.Always)]
            public List<ManagedCrystalReportColumn> Columns { get; set; }

            [JsonProperty("filters", Required = Newtonsoft.Json.Required.Always)]
            public List<string> Filters { get; set; }

            [JsonProperty("parameters", Required = Newtonsoft.Json.Required.Always)]
            public List<ManagedCrystalReportParameter> Parameters { get; set; }
        }

        private sealed class ManagedCrystalReportColumn
        {
            [JsonProperty("name", Required = Newtonsoft.Json.Required.Always)]
            public string Name { get; set; }

            [JsonProperty("type", Required = Newtonsoft.Json.Required.Always)]
            public string Type { get; set; }

            [JsonProperty("nullable", Required = Newtonsoft.Json.Required.Always)]
            public bool Nullable { get; set; }
        }

        private sealed class ManagedCrystalReportParameter
        {
            [JsonProperty("name", Required = Newtonsoft.Json.Required.Always)]
            public string Name { get; set; }

            [JsonProperty("type", Required = Newtonsoft.Json.Required.Always)]
            public string Type { get; set; }

            [JsonProperty("required", Required = Newtonsoft.Json.Required.Always)]
            public bool Required { get; set; }

            [JsonProperty("allowMultipleValues", Required = Newtonsoft.Json.Required.Always)]
            public bool AllowMultipleValues { get; set; }

            [JsonProperty("discreteOnly", Required = Newtonsoft.Json.Required.Always)]
            public bool DiscreteOnly { get; set; }

            [JsonProperty("allowedValues", Required = Newtonsoft.Json.Required.Always)]
            public List<string> AllowedValues { get; set; }
        }
    }

    public sealed class CrystalReportProfile
    {
        public CrystalReportProfile(
            string entityKey,
            string scope,
            string tableName,
            int maximumRows,
            IReadOnlyList<CrystalReportColumnProfile> columns,
            IReadOnlyList<string> filters,
            IReadOnlyList<CrystalReportParameterProfile> parameters)
        {
            EntityKey = entityKey;
            Scope = scope;
            TableName = tableName;
            MaximumRows = maximumRows;
            Columns = columns;
            Filters = filters;
            Parameters = parameters;
            RequiredColumns = new ReadOnlyCollection<string>(
                columns.Select(column => column.Name).ToList());
        }

        public string EntityKey { get; private set; }
        public string Scope { get; private set; }
        public string TableName { get; private set; }
        public int MaximumRows { get; private set; }
        public IReadOnlyList<CrystalReportColumnProfile> Columns { get; private set; }
        public IReadOnlyList<string> Filters { get; private set; }
        public IReadOnlyList<CrystalReportParameterProfile> Parameters { get; private set; }
        public IReadOnlyCollection<string> RequiredColumns { get; private set; }
    }

    public sealed class CrystalReportColumnProfile
    {
        public CrystalReportColumnProfile(string name, string type, bool nullable)
        {
            Name = name;
            Type = type;
            Nullable = nullable;
        }

        public string Name { get; private set; }
        public string Type { get; private set; }
        public bool Nullable { get; private set; }
    }

    public sealed class CrystalReportParameterProfile
    {
        public CrystalReportParameterProfile(
            string name,
            string type,
            bool required,
            bool allowMultipleValues,
            bool discreteOnly,
            IReadOnlyList<string> allowedValues)
        {
            Name = name;
            Type = type;
            Required = required;
            AllowMultipleValues = allowMultipleValues;
            DiscreteOnly = discreteOnly;
            AllowedValues = allowedValues;
        }

        public string Name { get; private set; }
        public string Type { get; private set; }
        public bool Required { get; private set; }
        public bool AllowMultipleValues { get; private set; }
        public bool DiscreteOnly { get; private set; }
        public IReadOnlyList<string> AllowedValues { get; private set; }
    }

    public sealed class UnsupportedCrystalReportProfileException : Exception
    {
        public UnsupportedCrystalReportProfileException(string message) : base(message)
        {
        }
    }
}
