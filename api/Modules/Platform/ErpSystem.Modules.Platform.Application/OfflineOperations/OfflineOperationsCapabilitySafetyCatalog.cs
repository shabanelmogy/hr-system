using ErpSystem.Modules.Platform.Contracts.OfflineOperations;

namespace ErpSystem.Modules.Platform.Application.OfflineOperations;

internal static class OfflineOperationsCapabilitySafetyCatalog
{
    private static readonly IReadOnlyDictionary<string, IReadOnlyList<string>> Definitions =
        new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal)
        {
            [OfflineOperationCapabilityIds.CountriesRead] =
                [OfflineOperationModes.OnlineOnly, OfflineOperationModes.OfflineRead],

            // Aggregate-level SQL Server rowVersion is enforced for child-only
            // workforce-plan edits, and the client replay contract reconciles
            // ambiguous outcomes before any retry. Tenant/company policy remains
            // online-only by default and must explicitly opt in.
            [OfflineOperationCapabilityIds.WorkforcePlanUpdateDraft] =
                [OfflineOperationModes.OnlineOnly, OfflineOperationModes.OfflineDraft, OfflineOperationModes.OfflineCommand]
        };

    public static IReadOnlyList<OfflineOperationCapabilityResponse> GetDefinitions() =>
        Definitions
            .OrderBy(pair => pair.Key, StringComparer.Ordinal)
            .Select(pair => new OfflineOperationCapabilityResponse(pair.Key, pair.Value))
            .ToArray();

    public static IReadOnlyDictionary<string, string> CreateFailClosedModes() =>
        Definitions.Keys.ToDictionary(
            capabilityId => capabilityId,
            _ => OfflineOperationModes.OnlineOnly,
            StringComparer.Ordinal);

    public static IReadOnlyDictionary<string, string> NormalizeStoredModes(
        IReadOnlyDictionary<string, string>? storedModes)
    {
        var safe = new Dictionary<string, string>(CreateFailClosedModes(), StringComparer.Ordinal);
        if (storedModes is null)
            return safe;

        foreach (var definition in Definitions)
        {
            if (storedModes.TryGetValue(definition.Key, out var mode) &&
                definition.Value.Contains(mode, StringComparer.Ordinal))
            {
                safe[definition.Key] = mode;
            }
        }

        return safe;
    }

    public static IReadOnlyDictionary<string, string> ValidateReplacement(
        IReadOnlyDictionary<string, string>? requestedModes)
    {
        if (requestedModes is null)
            throw new OfflineOperationsPolicyValidationException("Offline operation modes are required.");

        var unknown = requestedModes.Keys
            .Where(key => !Definitions.ContainsKey(key))
            .Order(StringComparer.Ordinal)
            .ToArray();
        if (unknown.Length > 0)
        {
            throw new OfflineOperationsPolicyValidationException(
                $"Unknown offline operation capabilities: {string.Join(", ", unknown)}.");
        }

        var missing = Definitions.Keys
            .Where(key => !requestedModes.ContainsKey(key))
            .Order(StringComparer.Ordinal)
            .ToArray();
        if (missing.Length > 0)
        {
            throw new OfflineOperationsPolicyValidationException(
                $"The complete offline operation policy is required. Missing: {string.Join(", ", missing)}.");
        }

        var normalized = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var definition in Definitions)
        {
            var mode = requestedModes[definition.Key];
            if (!definition.Value.Contains(mode, StringComparer.Ordinal))
            {
                throw new OfflineOperationsPolicyValidationException(
                    $"Mode '{mode}' is not supported for capability '{definition.Key}'.");
            }

            normalized[definition.Key] = mode;
        }

        return normalized;
    }
}
