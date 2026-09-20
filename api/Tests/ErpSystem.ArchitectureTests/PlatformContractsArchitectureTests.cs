using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;
using System.Xml.Linq;
using Xunit;

namespace ErpSystem.ArchitectureTests;

public sealed class PlatformContractsArchitectureTests
{
    private static readonly string ApiRoot = FindApiRoot();
    private static readonly string ContractsRoot = Path.Combine(
        ApiRoot,
        "Modules",
        "Platform",
        "ErpSystem.Modules.Platform.Contracts");

    private static readonly HashSet<string> ApprovedNamespaces = new(StringComparer.Ordinal)
    {
        "ErpSystem.Modules.Platform.Contracts",
        "ErpSystem.Modules.Platform.Contracts.Authentication.Tokens",
        "ErpSystem.Modules.Platform.Contracts.Authorization",
        "ErpSystem.Modules.Platform.Contracts.CompanyAccess",
        "ErpSystem.Modules.Platform.Contracts.Communications",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs",
        "ErpSystem.Modules.Platform.Contracts.Files",
        "ErpSystem.Modules.Platform.Contracts.Files.Models",
        "ErpSystem.Modules.Platform.Contracts.Notifications",
        "ErpSystem.Modules.Platform.Contracts.SecurityAudits",
        "ErpSystem.Modules.Platform.Contracts.Tenancy"
    };

    private static readonly HashSet<string> ApprovedPublicTypes = new(StringComparer.Ordinal)
    {
        "ErpSystem.Modules.Platform.Contracts.AssemblyReference",
        "ErpSystem.Modules.Platform.Contracts.Authentication.Tokens.AuthenticationTokenClaimNames",
        "ErpSystem.Modules.Platform.Contracts.Authorization.PermissionClaimNames",
        "ErpSystem.Modules.Platform.Contracts.Authorization.PlatformRoleNames",
        "ErpSystem.Modules.Platform.Contracts.Authorization.PlatformPermissions",
        "ErpSystem.Modules.Platform.Contracts.Authorization.PlatformRoleOption",
        "ErpSystem.Modules.Platform.Contracts.Authorization.IPlatformAuthorizationSource",
        "ErpSystem.Modules.Platform.Contracts.CompanyAccess.ICompanyGeographySource",
        "ErpSystem.Modules.Platform.Contracts.Communications.WhatsAppTextMessage",
        "ErpSystem.Modules.Platform.Contracts.Communications.WhatsAppSendResult",
        "ErpSystem.Modules.Platform.Contracts.Communications.IWhatsAppSender",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs.EntityChangeLogsRequest",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs.EntityChangeLogsResponse",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs.EntityChangeLogRecord",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs.IEntityChangeLogStore",
        "ErpSystem.Modules.Platform.Contracts.EntityChangeLogs.IEntityChangeLogService",
        "ErpSystem.Modules.Platform.Contracts.Files.PlatformFileUpload",
        "ErpSystem.Modules.Platform.Contracts.Files.FileUploadSecurityFailureKind",
        "ErpSystem.Modules.Platform.Contracts.Files.FileUploadSecurityException",
        "ErpSystem.Modules.Platform.Contracts.Files.IFileUploadInspectionService",
        "ErpSystem.Modules.Platform.Contracts.Files.Models.FileUpload",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationSeverity",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationPublishRequest",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationPublishError",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationPublishResult",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationPublishErrorCodes",
        "ErpSystem.Modules.Platform.Contracts.Notifications.INotificationPublisher",
        "ErpSystem.Modules.Platform.Contracts.Notifications.NotificationPublishRequestFactory",
        "ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditOutcome",
        "ErpSystem.Modules.Platform.Contracts.SecurityAudits.SecurityAuditRequest",
        "ErpSystem.Modules.Platform.Contracts.SecurityAudits.ISecurityAuditService",
        "ErpSystem.Modules.Platform.Contracts.Tenancy.AllowTenantReadOnlyAttribute"
    };

    [Fact]
    public void PlatformContracts_ProjectRemainsDependencyFree()
    {
        var project = XDocument.Load(Path.Combine(
            ContractsRoot,
            "ErpSystem.Modules.Platform.Contracts.csproj"));

        Assert.Empty(project.Descendants("PackageReference"));
        Assert.Empty(project.Descendants("ProjectReference"));
        Assert.Empty(project.Descendants("FrameworkReference"));
    }

    [Fact]
    public void PlatformContracts_PublicSurfaceIsExplicitlyApproved()
    {
        var actual = new HashSet<string>(StringComparer.Ordinal);
        var unexpectedNamespaces = new HashSet<string>(StringComparer.Ordinal);

        foreach (var source in SourceFiles())
        {
            var text = File.ReadAllText(source);
            var namespaceMatch = Regex.Match(
                text,
                @"(?m)^\s*namespace\s+(?<name>[A-Za-z_][A-Za-z0-9_.]*)\s*[;{]");
            Assert.True(namespaceMatch.Success, $"Contracts source has no namespace: {source}");

            var @namespace = namespaceMatch.Groups["name"].Value;
            if (!ApprovedNamespaces.Contains(@namespace))
                unexpectedNamespaces.Add(@namespace);

            foreach (Match typeMatch in Regex.Matches(
                         text,
                         @"(?m)^\s*public\s+(?:(?:sealed|static|abstract|partial|readonly)\s+)*(?:class|record(?:\s+(?:class|struct))?|struct|interface|enum)\s+(?<name>[A-Za-z_][A-Za-z0-9_]*)"))
            {
                actual.Add($"{@namespace}.{typeMatch.Groups["name"].Value}");
            }
        }

        Assert.True(
            unexpectedNamespaces.Count == 0,
            "Platform.Contracts gained an unapproved namespace: " + string.Join(", ", unexpectedNamespaces));
        Assert.True(
            ApprovedPublicTypes.SetEquals(actual),
            "Platform.Contracts public surface changed. Added: "
            + string.Join(", ", actual.Except(ApprovedPublicTypes).OrderBy(value => value, StringComparer.Ordinal))
            + "; Missing: "
            + string.Join(", ", ApprovedPublicTypes.Except(actual).OrderBy(value => value, StringComparer.Ordinal)));
    }

    [Fact]
    public void PlatformContracts_DoesNotRegainApplicationRuntimePorts()
    {
        string[] forbiddenIdentifiers =
        [
            "AuthenticationTokenOptions",
            "IAuthenticationTokenService",
            "IAuthenticationTokenValidationParametersFactory",
            "IAccessTokenClaimMaterialSource",
            "IAccessTokenClaimMaterialService",
            "ISelectionChallengeSource",
            "ISelectionChallengeService",
            "IAuthenticationLoginOrchestrator",
            "IAuthenticationSessionOrchestrator",
            "IAuthenticationAccountOrchestrator",
            "ISessionValidationSource",
            "ISessionValidationService",
            "ITenantMembershipSource",
            "ITenantMembershipService",
            "ITenantAccessSource",
            "ITenantAccessService",
            "ITenantModuleEntitlementSource",
            "ITenantModuleEntitlementService",
            "IModuleCatalogPolicy",
            "IModuleCatalogQueries",
            "INotificationInboxStore",
            "INotificationInboxEffects",
            "INotificationPublicationStore",
            "INotificationDeliveryEffects",
            "IFileMetadataStore",
            "IFileBinaryStore",
            "IFileChangePublisher",
            "IEntityChangeLogQueryStore",
            "EntityChangeLogQueryRecord",
            "IOfflineOperationsPolicyStore",
            "IOfflineOperationsPolicyService"
        ];

        var combinedSource = string.Join(Environment.NewLine, SourceFiles().Select(File.ReadAllText));
        var violations = forbiddenIdentifiers
            .Where(identifier => Regex.IsMatch(combinedSource, $@"\b{Regex.Escape(identifier)}\b"))
            .ToArray();

        Assert.True(
            violations.Length == 0,
            "Platform-only application/runtime contracts leaked back into Platform.Contracts: "
            + string.Join(", ", violations));
    }

    private static IEnumerable<string> SourceFiles() =>
        Directory.GetFiles(ContractsRoot, "*.cs", SearchOption.AllDirectories)
            .Where(path => !path.Contains(
                $"{Path.DirectorySeparatorChar}obj{Path.DirectorySeparatorChar}",
                StringComparison.OrdinalIgnoreCase))
            .Where(path => !path.Contains(
                $"{Path.DirectorySeparatorChar}bin{Path.DirectorySeparatorChar}",
                StringComparison.OrdinalIgnoreCase));

    private static string FindApiRoot([CallerFilePath] string sourcePath = "")
    {
        foreach (var start in new[]
                 {
                     Path.GetDirectoryName(sourcePath),
                     Directory.GetCurrentDirectory(),
                     AppContext.BaseDirectory
                 }.Where(value => !string.IsNullOrWhiteSpace(value)))
        {
            for (var directory = new DirectoryInfo(start!); directory is not null; directory = directory.Parent)
            {
                if (File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln"))
                    && Directory.Exists(Path.Combine(directory.FullName, "Modules")))
                    return directory.FullName;
            }
        }

        throw new DirectoryNotFoundException("Could not locate the ERPSYSTEM API root.");
    }
}
