using Microsoft.Data.SqlClient;

namespace ErpSystem.IntegrationTests;

/// <summary>
/// Marks a test that requires SQL Server. An explicit
/// ERPSYSTEM_TEST_SQLSERVER_CONNECTION always wins; Windows development runs
/// use LocalDB by default so real-database gates do not silently disappear.
/// </summary>
[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
public sealed class SqlServerFactAttribute : FactAttribute
{
    public SqlServerFactAttribute()
    {
        if (!OperatingSystem.IsWindows()
            && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(
                SqlServerTestDatabase.ConnectionEnvironmentVariable)))
        {
            Skip =
                $"Set {SqlServerTestDatabase.ConnectionEnvironmentVariable} to run this SQL Server integration test on non-Windows hosts.";
        }
    }
}

/// <summary>
/// Creates an isolated SQL Server database for one test and removes it when the
/// test finishes. Database names are generated locally and are never written to
/// test output; the configured server credential is never interpolated into SQL.
/// </summary>
public sealed class SqlServerTestDatabase : IAsyncDisposable
{
    public const string ConnectionEnvironmentVariable = "ERPSYSTEM_TEST_SQLSERVER_CONNECTION";
    private const string WindowsLocalDbConnection =
        "Server=(localdb)\\MSSQLLocalDB;Database=master;Integrated Security=True;TrustServerCertificate=True";

    private readonly string _adminConnectionString;
    private bool _disposed;

    private SqlServerTestDatabase(
        string name,
        string connectionString,
        string adminConnectionString)
    {
        Name = name;
        ConnectionString = connectionString;
        _adminConnectionString = adminConnectionString;
    }

    public string Name { get; }

    public string ConnectionString { get; }

    public static async Task<SqlServerTestDatabase> CreateAsync(
        string purpose,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(purpose);

        var baseConnectionString = ResolveBaseConnectionString();

        var safePurpose = new string(
            purpose
                .Where(character => char.IsLetterOrDigit(character) || character == '_')
                .ToArray());
        if (string.IsNullOrWhiteSpace(safePurpose))
            safePurpose = "ErpSystemTest";

        var databaseName = $"{safePurpose}_{Guid.NewGuid():N}";
        var adminBuilder = new SqlConnectionStringBuilder(baseConnectionString)
        {
            InitialCatalog = "master"
        };
        var databaseConnectionString = new SqlConnectionStringBuilder(baseConnectionString)
        {
            InitialCatalog = databaseName
        };

        await using var connection = new SqlConnection(adminBuilder.ConnectionString);
        await connection.OpenAsync(cancellationToken).ConfigureAwait(false);
        await using var command = connection.CreateCommand();
        command.CommandText = $"CREATE DATABASE {QuoteIdentifier(databaseName)};";
        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);

        return new SqlServerTestDatabase(
            databaseName,
            databaseConnectionString.ConnectionString,
            adminBuilder.ConnectionString);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
            return;

        _disposed = true;
        SqlConnection.ClearAllPools();

        try
        {
            await using var connection = new SqlConnection(_adminConnectionString);
            await connection.OpenAsync().ConfigureAwait(false);
            await using var command = connection.CreateCommand();
            command.CommandText =
                $"IF DB_ID(N'{EscapeLiteral(Name)}') IS NOT NULL BEGIN " +
                $"ALTER DATABASE {QuoteIdentifier(Name)} SET SINGLE_USER WITH ROLLBACK IMMEDIATE; " +
                $"DROP DATABASE {QuoteIdentifier(Name)}; END;";
            await command.ExecuteNonQueryAsync().ConfigureAwait(false);
        }
        catch (Exception exception)
        {
            // Cleanup failures must be observable; otherwise a passing test can
            // leave an isolated database behind indefinitely.
            throw new InvalidOperationException(
                $"Could not remove isolated SQL Server test database '{Name}'.",
                exception);
        }
    }

    private static string QuoteIdentifier(string identifier) =>
        $"[{identifier.Replace("]", "]]", StringComparison.Ordinal)}]";

    private static string EscapeLiteral(string value) =>
        value.Replace("'", "''", StringComparison.Ordinal);

    private static string ResolveBaseConnectionString()
    {
        var configured = Environment.GetEnvironmentVariable(ConnectionEnvironmentVariable);
        if (!string.IsNullOrWhiteSpace(configured))
            return configured;

        if (OperatingSystem.IsWindows())
            return WindowsLocalDbConnection;

        throw new InvalidOperationException(
            $"{ConnectionEnvironmentVariable} must be configured before creating a SQL Server test database on this host.");
    }
}

