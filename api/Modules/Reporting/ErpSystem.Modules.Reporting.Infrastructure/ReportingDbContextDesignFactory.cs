using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Reporting.Infrastructure;

/// <summary>
/// Creates only the Reporting context for EF design-time commands without
/// booting the API host or any other module.
/// </summary>
public sealed class ReportingDbContextDesignFactory
    : IDesignTimeDbContextFactory<ReportingDbContext>
{
    public ReportingDbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString();

        var options = new DbContextOptionsBuilder<ReportingDbContext>()
            .UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(ReportingDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ReportingDbContext.Schema))
            .Options;

        return new ReportingDbContext(options);
    }

    private static string ResolveConnectionString()
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";
        // AddEnvironmentVariables below loads ConnectionStrings__Reporting
        // and ConnectionStrings__DefaultConnection after every optional JSON source.
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindApiDirectory())
            .AddJsonFile("appsettings.example.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings." + environment + ".json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        foreach (var name in new[] { "Reporting", "DefaultConnection" })
        {
            var candidate = configuration.GetConnectionString(name);
            if (IsConfigured(candidate))
                return candidate!;
        }

        throw new InvalidOperationException(
            "No effective connection string was configured. Set ConnectionStrings:Reporting "
            + "or ConnectionStrings:DefaultConnection before running Reporting EF design-time commands.");
    }

    private static bool IsConfigured(string? value)
    {
        var trimmed = value?.Trim();
        return !string.IsNullOrWhiteSpace(trimmed)
            && !(trimmed.StartsWith('<') && trimmed.EndsWith('>'));
    }

    private static string FindApiDirectory()
    {
        for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
             directory is not null;
             directory = directory.Parent)
        {
            if (IsApiDirectory(directory.FullName))
                return directory.FullName;

            var directCandidate = Path.Combine(directory.FullName, "ErpSystem.Api");
            if (IsApiDirectory(directCandidate))
                return directCandidate;

            var repositoryCandidate = Path.Combine(directory.FullName, "api", "ErpSystem.Api");
            if (IsApiDirectory(repositoryCandidate))
                return repositoryCandidate;
        }

        throw new InvalidOperationException(
            "Unable to locate ErpSystem.Api.csproj or appsettings.example.json for EF design-time commands.");
    }

    private static bool IsApiDirectory(string path) =>
        File.Exists(Path.Combine(path, "ErpSystem.Api.csproj")) ||
        File.Exists(Path.Combine(path, "appsettings.example.json"));
}