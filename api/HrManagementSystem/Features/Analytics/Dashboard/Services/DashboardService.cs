using HrManagementSystem.Features.Analytics.Dashboard.Contracts;

namespace HrManagementSystem.Features.Analytics.Dashboard.Services
{
    public class DashboardService(ApplicationDbContext context) : IDashboardService
    {
        private readonly ApplicationDbContext _context = context;
        public async Task<Result<UsersCountResponse>> GetUsersCountAsync(CancellationToken cancellationToken = default)
        {
            var count = await _context.Users
                //.Where(x => !x.IsDisabled)
                .CountAsync(cancellationToken: cancellationToken);

            var response = new UsersCountResponse(count);

            return Result.Success(response);
        }

    }
}
