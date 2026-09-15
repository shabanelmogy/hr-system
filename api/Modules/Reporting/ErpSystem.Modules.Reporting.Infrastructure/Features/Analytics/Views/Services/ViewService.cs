using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views;
using ErpSystem.Modules.Reporting.Application.Features.Analytics.Views.Contracts;
using ErpSystem.BuildingBlocks.Application.Common.Realtime;

namespace ErpSystem.Modules.Reporting.Infrastructure.Features.Analytics.Views.Services
{
    public sealed class ViewStore(ReportingDbContext context) : IViewStore
    {
        private readonly ReportingDbContext _context = context;

        public async Task CreateOrAlterAsync(ViewRequest view, CancellationToken cancellationToken = default)
        {
            var sql = $@"CREATE OR ALTER VIEW [{view.ViewName}] AS {view.ViewQuery}";

            await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }

        public async Task<List<ViewResponse>> GetAllAsync(CancellationToken cancellationToken = default)
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

        public async Task DropAsync(string viewName, CancellationToken cancellationToken = default)
        {
            var sql = $"DROP VIEW IF EXISTS [{viewName}]";
            await _context.Database.ExecuteSqlRawAsync(sql, cancellationToken);
        }

        public async Task<List<string>> GetTablesAsync(CancellationToken cancellationToken = default)
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
            var columns = await _context.Database
                .SqlQueryRaw<string>(
                    @"SELECT COLUMN_NAME 
                  FROM INFORMATION_SCHEMA.COLUMNS 
                  WHERE TABLE_NAME = @p0", tableName)
                .ToListAsync(cancellationToken);

            return columns;
        }
    }

    public sealed class ViewEffects(IRealtimeChangeDispatcher realtimeChanges) : IViewEffects
    {
        public void DispatchChange(string action, string viewName) =>
            realtimeChanges.Dispatch(new RealtimeChangeRequest(
                RealtimeAudience.ForPermission(ReportingPermissions.ManageDatabaseViews),
                "database-views",
                action,
                viewName,
                Guid.NewGuid()));
    }
}
