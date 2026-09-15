using System.Text.Json;

namespace ErpSystem.ArchitectureTests;

public sealed class MigrationOperationsTests
{
    [Fact]
    public void ModelDriftGate_DiscoversEveryRegisteredModuleInsteadOfHardCodingContexts()
    {
        var apiRoot = FindApiRoot();
        var script = File.ReadAllText(Path.Combine(apiRoot, "scripts", "Test-ErpModuleModelDrift.ps1"));
        var workflow = File.ReadAllText(Path.Combine(Directory.GetParent(apiRoot)!.FullName, ".github", "workflows", "api-ci.yml"));

        Assert.Contains("ErpModuleRegistry.cs", script, StringComparison.Ordinal);
        Assert.Contains("*DbContext.cs", script, StringComparison.Ordinal);
        Assert.Contains("has-pending-model-changes", script, StringComparison.Ordinal);
        Assert.Contains("RegexOptions]::IgnoreCase", script, StringComparison.Ordinal);
        Assert.Contains("if ($LASTEXITCODE -ne 0)", script, StringComparison.Ordinal);
        Assert.Contains("Test-ErpModuleModelDrift.ps1 -Configuration Release -NoBuild", workflow, StringComparison.Ordinal);
        Assert.DoesNotContain("dotnet ef migrations has-pending-model-changes --project ./Modules/", workflow, StringComparison.Ordinal);
    }

    [Fact]
    public void MigrationScript_UsesRegistryAndModuleLocalEfFactoriesWithoutEmbeddingSecrets()
    {
        var script = File.ReadAllText(Path.Combine(FindApiRoot(), "scripts", "Apply-ErpModuleMigrations.ps1"));

        Assert.Contains("ErpModuleRegistry.cs", script, StringComparison.Ordinal);
        Assert.Contains("RegexOptions]::IgnoreCase", script, StringComparison.Ordinal);
        Assert.Contains("SupportsShouldProcess", script, StringComparison.Ordinal);
        Assert.Contains("dotnet", script, StringComparison.Ordinal);
        Assert.Contains("ef", script, StringComparison.Ordinal);
        Assert.Contains("database", script, StringComparison.Ordinal);
        Assert.Contains("update", script, StringComparison.Ordinal);
        Assert.DoesNotContain("--verbosity", script, StringComparison.Ordinal);
        Assert.Contains("DesignFactory", script, StringComparison.Ordinal);
        Assert.Contains("PSBoundParameters.ContainsKey", script, StringComparison.Ordinal);
        Assert.Contains("ConnectionStrings__$($_.Name)", script, StringComparison.Ordinal);
        Assert.DoesNotContain("Server=", script, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Password=", script, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("ConnectionString = \"", script, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void MigrationScript_UsesSelectedEnvironmentAndRestoresProcessValues()
    {
        var script = File.ReadAllText(Path.Combine(FindApiRoot(), "scripts", "Apply-ErpModuleMigrations.ps1"));

        Assert.Contains("[ValidateSet(\"Development\", \"Staging\", \"Production\")]", script, StringComparison.Ordinal);
        Assert.Contains("[string]$Environment = \"Development\"", script, StringComparison.Ordinal);
        Assert.Contains("DOTNET_ENVIRONMENT", script, StringComparison.Ordinal);
        Assert.Contains("ASPNETCORE_ENVIRONMENT", script, StringComparison.Ordinal);
        Assert.Contains(
            "[Environment]::GetEnvironmentVariable(\"DOTNET_ENVIRONMENT\", \"Process\")",
            script,
            StringComparison.Ordinal);
        Assert.Contains(
            "[Environment]::GetEnvironmentVariable(\"ASPNETCORE_ENVIRONMENT\", \"Process\")",
            script,
            StringComparison.Ordinal);
        Assert.Contains(
            "[Environment]::SetEnvironmentVariable(\"DOTNET_ENVIRONMENT\", $Environment, \"Process\")",
            script,
            StringComparison.Ordinal);
        Assert.Contains(
            "[Environment]::SetEnvironmentVariable(\"ASPNETCORE_ENVIRONMENT\", $Environment, \"Process\")",
            script,
            StringComparison.Ordinal);
        Assert.Contains("finally", script, StringComparison.Ordinal);
        Assert.DoesNotContain("$missingConnections", script, StringComparison.Ordinal);
        Assert.DoesNotContain("No effective connection string was configured", script, StringComparison.Ordinal);
    }

    [Fact]
    public void CheckedInApiSettingsTemplate_ContainsNoKnownDeploymentCredentials()
    {
        var apiRoot = Path.Combine(FindApiRoot(), "ErpSystem.Api");
        const string settingsName = "appsettings.example.json";
        var settingsPath = Path.Combine(apiRoot, settingsName);
        Assert.True(File.Exists(settingsPath), $"Required settings template is missing: {settingsName}");

        using var document = JsonDocument.Parse(File.ReadAllText(settingsPath));
        AssertSafeSettings(document.RootElement, settingsName);
        Assert.NotEqual("*", document.RootElement.GetProperty("AllowedHosts").GetString());
        Assert.False(document.RootElement
            .GetProperty("SwaggerSettings")
            .GetProperty("Enabled")
            .GetBoolean());
        Assert.All(
            document.RootElement
                .GetProperty("CorsSettings")
                .GetProperty("AllowedOrigins")
                .EnumerateArray(),
            origin => Assert.StartsWith("https://", origin.GetString(), StringComparison.OrdinalIgnoreCase));

        var apiGitIgnore = File.ReadAllText(Path.Combine(FindApiRoot(), ".gitignore"));
        Assert.Contains("ErpSystem.Api/appsettings.json", apiGitIgnore, StringComparison.Ordinal);
        Assert.Contains("ErpSystem.Api/appsettings.Development.json", apiGitIgnore, StringComparison.Ordinal);
    }

    [Fact]
    public void ApiSettings_SerilogUsesConsoleWithoutStartupFileOrDatabaseSinks()
    {
        var apiRoot = Path.Combine(FindApiRoot(), "ErpSystem.Api");
        var settingsFiles = Directory.GetFiles(apiRoot, "appsettings*.json", SearchOption.TopDirectoryOnly);

        Assert.NotEmpty(settingsFiles);
        foreach (var settingsPath in settingsFiles)
        {
            using var document = JsonDocument.Parse(File.ReadAllText(settingsPath));
            if (document.RootElement.TryGetProperty("Serilog", out var serilog))
                AssertConsoleOnlySerilog(serilog, Path.GetFileName(settingsPath));
        }
    }

    [Fact]
    public void ApiCi_UsesPinnedCurrentTreeSecretScan()
    {
        var apiRoot = FindApiRoot();
        var repositoryRoot = Directory.GetParent(apiRoot)!.FullName;
        var workflow = File.ReadAllText(Path.Combine(repositoryRoot, ".github", "workflows", "api-ci.yml"));
        var gitleaksConfig = File.ReadAllText(Path.Combine(repositoryRoot, ".gitleaks.toml"));

        Assert.Contains("ghcr.io/gitleaks/gitleaks:v8.29.1", workflow, StringComparison.Ordinal);
        Assert.Contains("dir --redact", workflow, StringComparison.Ordinal);
        Assert.Contains(".gitleaks.toml", workflow, StringComparison.Ordinal);
        Assert.DoesNotContain("gitleaks:v8.29.1 git", workflow, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("paths:", workflow, StringComparison.Ordinal);
        Assert.Contains("useDefault = true", gitleaksConfig, StringComparison.Ordinal);
        Assert.Contains("node_modules", gitleaksConfig, StringComparison.Ordinal);
        Assert.DoesNotContain("appsettings", gitleaksConfig, StringComparison.OrdinalIgnoreCase);
    }

    private static void AssertSafeSettings(JsonElement root, string settingsName)
    {
        var hasConnections = root.TryGetProperty("ConnectionStrings", out var connections);
        if (hasConnections)
        {
            foreach (var connection in connections.EnumerateObject())
                AssertPlaceholderOrEmpty(connection.Value.GetString(), $"{settingsName}:ConnectionStrings:{connection.Name}");
        }

        if (root.TryGetProperty("JwtOptions", out var jwt))
            AssertPlaceholderOrEmpty(jwt.GetProperty("Key").GetString(), $"{settingsName}:JwtOptions:Key");

        if (root.TryGetProperty("MailSettings", out var mail))
            AssertPlaceholderOrEmpty(mail.GetProperty("Password").GetString(), $"{settingsName}:MailSettings:Password");

        if (root.TryGetProperty("ExternalLogin", out var externalLogin) &&
            externalLogin.TryGetProperty("Google", out var google))
        {
            AssertPlaceholderOrEmpty(
                google.GetProperty("ClientSecret").GetString(),
                $"{settingsName}:ExternalLogin:Google:ClientSecret");
        }

        if (root.TryGetProperty("CrystalReports", out var crystalReports))
        {
            AssertPlaceholderOrEmpty(
                crystalReports.GetProperty("RuntimeApiKey").GetString(),
                $"{settingsName}:CrystalReports:RuntimeApiKey");
        }

        if (root.TryGetProperty("AttendanceConnector", out var attendanceConnector))
        {
            AssertPlaceholderOrEmpty(
                attendanceConnector.GetProperty("InternalApiKey").GetString(),
                $"{settingsName}:AttendanceConnector:InternalApiKey");
        }

        if (root.TryGetProperty("BootstrapUsers", out var bootstrapUsers))
        {
            Assert.False(bootstrapUsers.GetProperty("Enabled").GetBoolean());
            foreach (var bootstrapUser in bootstrapUsers.EnumerateObject())
            {
                if (bootstrapUser.Value.ValueKind != JsonValueKind.Object)
                    continue;

                AssertPlaceholderOrEmpty(
                    bootstrapUser.Value.GetProperty("Password").GetString(),
                    $"{settingsName}:BootstrapUsers:{bootstrapUser.Name}:Password");
            }
        }

        if (root.TryGetProperty("Serilog", out var serilog))
            AssertConsoleOnlySerilog(serilog, settingsName);

        if (string.Equals(settingsName, "appsettings.example.json", StringComparison.Ordinal))
        {
            Assert.True(hasConnections, "The tracked example must declare its connection settings.");
            Assert.True(
                connections.EnumerateObject()
                    .Any(connection => connection.Value.GetString()?.StartsWith('<') == true),
                "The tracked example must expose explicit connection placeholders.");
        }
    }

    private static void AssertConsoleOnlySerilog(JsonElement serilog, string settingsName)
    {
        Assert.True(
            serilog.TryGetProperty("WriteTo", out var writeTo) && writeTo.ValueKind == JsonValueKind.Array,
            $"{settingsName}:Serilog:WriteTo must be an array.");

        var sinkNames = writeTo.EnumerateArray()
            .Select(element => element.TryGetProperty("Name", out var name) ? name.GetString() : null)
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .ToArray();

        Assert.Contains(
            sinkNames,
            name => string.Equals(name, "Console", StringComparison.OrdinalIgnoreCase));
        Assert.DoesNotContain(
            sinkNames,
            name => string.Equals(name, "File", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(name, "MSSqlServer", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void EveryDesignFactory_DoesNotRequireIgnoredLiveAppSettings_AndRejectsPlaceholders()
    {
        var modulesRoot = Path.Combine(FindApiRoot(), "Modules");
        var factories = Directory.GetFiles(
                modulesRoot,
                "*DbContextDesignFactory.cs",
                SearchOption.AllDirectories)
            .Where(path =>
                !path.Contains(
                    Path.DirectorySeparatorChar + "bin" + Path.DirectorySeparatorChar,
                    StringComparison.OrdinalIgnoreCase)
                && !path.Contains(
                    Path.DirectorySeparatorChar + "obj" + Path.DirectorySeparatorChar,
                    StringComparison.OrdinalIgnoreCase))
            .ToArray();

        Assert.NotEmpty(factories);
        foreach (var factoryPath in factories)
        {
            var source = File.ReadAllText(factoryPath);
            Assert.Contains("ErpSystem.Api.csproj", source, StringComparison.Ordinal);
            Assert.Contains("appsettings.example.json", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.example.json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("AddJsonFile(\"appsettings.\" + environment + \".json\", optional: true", source, StringComparison.Ordinal);
            Assert.Contains("AddEnvironmentVariables()", source, StringComparison.Ordinal);
            Assert.Contains("StartsWith('<')", source, StringComparison.Ordinal);
            Assert.Contains("EndsWith('>')", source, StringComparison.Ordinal);
            Assert.Contains("No effective connection string was configured", source, StringComparison.Ordinal);
            Assert.DoesNotContain("AddJsonFile(\"appsettings.json\", optional: false", source, StringComparison.Ordinal);
            Assert.True(
                source.IndexOf("AddEnvironmentVariables()", StringComparison.Ordinal)
                > source.LastIndexOf("AddJsonFile(", StringComparison.Ordinal),
                $"{Path.GetFileName(factoryPath)} must apply environment variables after optional JSON files.");
        }
    }

    private static void AssertPlaceholderOrEmpty(string? value, string settingName)
    {
        var isPlaceholder = !string.IsNullOrWhiteSpace(value) &&
            value.StartsWith('<') &&
            value.EndsWith('>');

        Assert.True(
            string.IsNullOrWhiteSpace(value) || isPlaceholder,
            $"{settingName} must be empty or an explicit configuration placeholder.");
        Assert.DoesNotContain("Server=", value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Data Source=", value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("User Id=", value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Password=", value ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    private static string FindApiRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null &&
               !File.Exists(Path.Combine(directory.FullName, "ErpSystem.sln")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName
            ?? throw new InvalidOperationException("Could not locate the API solution root.");
    }
}

