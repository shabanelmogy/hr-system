using HrManagementSystem.Application.Abstractions.Authentication;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HrManagementSystem.Infrastructure.Persistence;

/// <summary>
/// Creates the model without starting the web host, applying migrations, or seeding data.
/// Runtime configuration and credentials remain owned by the API host.
/// </summary>
public sealed class ApplicationDbContextDesignFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
            ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";
        var apiDirectory = FindApiDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiDirectory)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile($"appsettings.{environment}.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
            throw new InvalidOperationException(
                "ConnectionStrings:DefaultConnection must be configured for EF design-time commands.");

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlServer(connectionString)
            .Options;

        return new ApplicationDbContext(options, DesignTimeActor.Instance, TimeProvider.System);
    }

    private static string FindApiDirectory()
    {
        for (var directory = new DirectoryInfo(Directory.GetCurrentDirectory());
             directory is not null;
             directory = directory.Parent)
        {
            var directCandidate = Path.Combine(directory.FullName, "HrManagementSystem.Api");
            if (File.Exists(Path.Combine(directCandidate, "appsettings.json")))
                return directCandidate;

            var repositoryCandidate = Path.Combine(
                directory.FullName, "api", "HrManagementSystem.Api");
            if (File.Exists(Path.Combine(repositoryCandidate, "appsettings.json")))
                return repositoryCandidate;
        }

        throw new InvalidOperationException(
            "Unable to locate HrManagementSystem.Api/appsettings.json for EF design-time commands.");
    }

    private sealed class DesignTimeActor : ICurrentActor
    {
        internal static readonly DesignTimeActor Instance = new();
        public string? UserId => null;
        public string? TenantId => null;
        public int? CompanyId => null;
    }
}
