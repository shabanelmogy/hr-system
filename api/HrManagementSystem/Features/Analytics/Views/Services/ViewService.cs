using HrManagementSystem.Features.Analytics.Views.Contracts;

namespace HrManagementSystem.Features.Analytics.Views.Services
{
    public class ViewService(ApplicationDbContext context) : IViewService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task CreateOrAlterViewAsync(ViewRequest view, CancellationToken cancellationToken = default)
        {
            ValidateIdentifier(view.ViewName);
            ValidateViewQuery(view.ViewQuery);

            var sql = $@"CREATE OR ALTER VIEW [{view.ViewName}] AS {view.ViewQuery}";

            await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }

        public async Task<List<ViewResponse>> GetAllViewsAsync(CancellationToken cancellationToken = default)
        {
            // Query to get all views and their definitions
            var views = await _context.Database
                .SqlQueryRaw<ViewResponse>(
                    @"SELECT 
                    TABLE_NAME AS ViewName,
                    VIEW_DEFINITION AS ViewQuery
                  FROM INFORMATION_SCHEMA.VIEWS")
                .ToListAsync(cancellationToken);

            return views;
        }

        public async Task DropViewAsync(string viewName, CancellationToken cancellationToken = default)
        {
            ValidateIdentifier(viewName);

            var sql = $"DROP VIEW IF EXISTS [{viewName}]";
            await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }

        public async Task<List<string>> GetAllTablesAsync(CancellationToken cancellationToken = default)
        {
            var tables = await _context.Database
                .SqlQueryRaw<string>(
                    @"SELECT TABLE_NAME 
                  FROM INFORMATION_SCHEMA.TABLES 
                  WHERE TABLE_TYPE = 'BASE TABLE'")
                .ToListAsync(cancellationToken);

            return tables;
        }

        public async Task<List<string>> GetTableColumnsAsync(string tableName, CancellationToken cancellationToken = default)
        {
            ValidateIdentifier(tableName);

            var columns = await _context.Database
                .SqlQueryRaw<string>(
                    @"SELECT COLUMN_NAME 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_NAME = @p0", tableName)
                .ToListAsync(cancellationToken);

            return columns;
        }

        private static void ValidateIdentifier(string identifier)
        {
            if (string.IsNullOrWhiteSpace(identifier) ||
                identifier.Length > 128 ||
                !identifier.All(character => char.IsAsciiLetterOrDigit(character) || character == '_') ||
                (!char.IsAsciiLetter(identifier[0]) && identifier[0] != '_'))
            {
                throw new ArgumentException("The database identifier is invalid.", nameof(identifier));
            }
        }

        private static void ValidateViewQuery(string? query)
        {
            var normalized = query?.Trim();
            if (string.IsNullOrWhiteSpace(normalized) ||
                !normalized.StartsWith("SELECT", StringComparison.OrdinalIgnoreCase) ||
                normalized.Contains(';') ||
                normalized.Contains("--", StringComparison.Ordinal) ||
                normalized.Contains("/*", StringComparison.Ordinal))
            {
                throw new ArgumentException("Only a single SELECT statement is allowed.", nameof(query));
            }
        }
    }
}
