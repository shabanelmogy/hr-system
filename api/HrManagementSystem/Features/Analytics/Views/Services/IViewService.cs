using HrManagementSystem.Features.Analytics.Views.Contracts;

namespace HrManagementSystem.Features.Analytics.Views.Services
{
    public interface IViewService
    {
        Task CreateOrAlterViewAsync(ViewRequest view, CancellationToken cancellationToken = default);
        Task<List<ViewResponse>> GetAllViewsAsync(CancellationToken cancellationToken = default);
        Task DropViewAsync(string viewName, CancellationToken cancellationToken = default);
        Task<List<string>> GetAllTablesAsync(CancellationToken cancellationToken = default);
        Task<List<string>> GetTableColumnsAsync(string tableName, CancellationToken cancellationToken = default);
    }
}
