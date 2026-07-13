using HrManagementSystem.Features.Analytics.Views.Contracts;

namespace HrManagementSystem.Features.Analytics.Views.Services
{
    public class ViewService(ApplicationDbContext context) : IViewService
    {
        private readonly ApplicationDbContext _context = context;

        public async Task CreateOrAlterViewAsync(ViewRequest view)
        {
            if (string.IsNullOrWhiteSpace(view.ViewName) || string.IsNullOrWhiteSpace(view.ViewQuery))
            {
                throw new ArgumentException("View name and query cannot be empty.");
            }

            var sql = $@"CREATE OR ALTER VIEW {view.ViewName} AS {view.ViewQuery}";

            await _context.Database.ExecuteSqlRawAsync(sql);
        }

        public async Task<List<ViewResponse>> GetAllViewsAsync()
        {
            // Query to get all views and their definitions
            var views = await _context.Database
                .SqlQueryRaw<ViewResponse>(
                    @"SELECT 
                    TABLE_NAME AS ViewName,
                    VIEW_DEFINITION AS ViewQuery
                  FROM INFORMATION_SCHEMA.VIEWS")
                .ToListAsync();

            return views;
        }

        public async Task DropViewAsync(string viewName)
        {
            if (string.IsNullOrWhiteSpace(viewName))
            {
                throw new ArgumentException("View name cannot be empty.");
            }

            // SQL to drop the view if it exists
            var sql = $"IF OBJECT_ID('{viewName}', 'V') IS NOT NULL DROP VIEW {viewName}";
            await _context.Database.ExecuteSqlRawAsync(sql);
        }

        public async Task<List<string>> GetAllTablesAsync()
        {
            var tables = await _context.Database
                .SqlQueryRaw<string>(
                    @"SELECT TABLE_NAME 
                  FROM INFORMATION_SCHEMA.TABLES 
                  WHERE TABLE_TYPE = 'BASE TABLE'")
                .ToListAsync();

            return tables;
        }

        public async Task<List<string>> GetTableColumnsAsync(string tableName)
        {
            if (string.IsNullOrWhiteSpace(tableName))
            {
                throw new ArgumentException("Table name cannot be empty.");
            }

            var columns = await _context.Database
                .SqlQueryRaw<string>(
                    @"SELECT COLUMN_NAME 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_NAME = @p0", tableName)
                .ToListAsync();

            return columns;
        }
    }
}
