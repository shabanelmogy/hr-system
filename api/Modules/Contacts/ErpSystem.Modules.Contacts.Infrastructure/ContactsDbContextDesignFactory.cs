using ErpSystem.BuildingBlocks.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ErpSystem.Modules.Contacts.Infrastructure;

/// <summary>
/// Creates only the Contacts context for EF design-time commands without
/// booting the API host or any other module.
/// </summary>
public sealed class ContactsDbContextDesignFactory
    : IDesignTimeDbContextFactory<ContactsDbContext>
{
    public ContactsDbContext CreateDbContext(string[] args)
    {
        var connectionString = ResolveConnectionString();

        var options = new DbContextOptionsBuilder<ContactsDbContext>()
            .UseSqlServer(
                connectionString,
                sql => sql.MigrationsAssembly(typeof(ContactsDbContext).Assembly.FullName)
                    .MigrationsHistoryTable("__EFMigrationsHistory", ContactsDbContext.Schema))
            .Options;

        return new ContactsDbContext(options, DesignTimeExecutionContext.Instance);
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

        foreach (var name in new[] { "Contacts", "DefaultConnection" })
        {
            var candidate = configuration.GetConnectionString(name);
            if (IsConfigured(candidate))
                return candidate!;
        }

        throw new InvalidOperationException(
            "No effective connection string was configured. Set ConnectionStrings:Contacts "
            + "or ConnectionStrings:DefaultConnection before running Contacts EF design-time commands.");
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

    private sealed class DesignTimeExecutionContext : ICurrentExecutionContext
    {
        internal static readonly DesignTimeExecutionContext Instance = new();
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
