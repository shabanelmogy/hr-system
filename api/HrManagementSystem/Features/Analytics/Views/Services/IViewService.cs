using HrManagementSystem.Features.Analytics.Views.Contracts;

namespace HrManagementSystem.Features.Analytics.Views.Services
{
    public interface IViewService
    {
        Task CreateOrAlterViewAsync(ViewRequest view);
        Task<List<ViewResponse>> GetAllViewsAsync();
        Task DropViewAsync(string viewName);
        Task<List<string>> GetAllTablesAsync();
        Task<List<string>> GetTableColumnsAsync(string tableName);
    }
}
