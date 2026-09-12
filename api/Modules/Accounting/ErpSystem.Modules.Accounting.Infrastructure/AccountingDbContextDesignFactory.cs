using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Accounting.Infrastructure;

/// <summary>
/// Creates only the Accounting context for EF design-time commands without
/// booting the API host or any other module.
/// </summary>
public sealed class AccountingDbContextDesignFactory
    : IDesignTimeDbContextFactory<AccountingDbContext>
{
    public AccountingDbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString();

        var options = new DbContextOptionsBuilder<AccountingDbContext>()
            .UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(AccountingDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", AccountingDbContext.Schema))
            .Options;

        return new AccountingDbContext(options);
    }

    private static string ResolveConnectionString()
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";
        var configuration = new ConfigurationBuilder()
            .SetBasePath(FindApiDirectory())
            .AddJsonFile("appsettings.example.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
            .AddJsonFile("appsettings." + environment + ".json", optional: true, reloadOnChange: false)
            .AddEnvironmentVariables()
            .Build();

        foreach (var name in new[] { "Accounting", "DefaultConnection" })
        {
            var candidate = configuration.GetConnectionString(name);
            if (IsConfigured(candidate))
                return candidate!;
        }

        throw new InvalidOperationException(
            "No effective connection string was configured. Set ConnectionStrings:Accounting "
            + "or ConnectionStrings:DefaultConnection before running Accounting EF design-time commands.");
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
