using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.PointOfSale.Infrastructure;

/// <summary>
/// Creates only the PointOfSale context for EF design-time commands without
/// booting the API host or any other module.
/// </summary>
public sealed class PointOfSaleDbContextDesignFactory
    : IDesignTimeDbContextFactory<PointOfSaleDbContext>
{
    public PointOfSaleDbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString();

        var options = new DbContextOptionsBuilder<PointOfSaleDbContext>()
            .UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(PointOfSaleDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", PointOfSaleDbContext.Schema))
            .Options;

        return new PointOfSaleDbContext(options);
    }

    private static string ResolveConnectionString()
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";
        // AddEnvironmentVariables below loads ConnectionStrings__PointOfSale
        // and ConnectionStrings__DefaultConnection after every optional JSON source.
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindApiDirectory())
            .AddJsonFile("appsettings.example.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings." + environment + ".json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        foreach (var name in new[] { "PointOfSale", "DefaultConnection" })
        {
            var candidate = configuration.GetConnectionString(name);
            if (IsConfigured(candidate))
                return candidate!;
        }

        throw new InvalidOperationException(
            "No effective connection string was configured. Set ConnectionStrings:PointOfSale "
            + "or ConnectionStrings:DefaultConnection before running PointOfSale EF design-time commands.");
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