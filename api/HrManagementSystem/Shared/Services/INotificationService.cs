namespace HrManagementSystem.Shared.Services
{
    public interface INotificationService
    {
        Task SendNewCompanyNotification(int? companyId);
    }
}
