using HrManagementSystem.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Features.Security.Authentication.Services;

public class LoginAuditService(ApplicationDbContext context) : ILoginAuditService
{
    private readonly ApplicationDbContext _context = context;

    public async Task RecordLoginAsync(string userId, CancellationToken cancellationToken)
    {
        _context.Add(new UserLogin
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            LoginDate = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RecordLogoutAsync(string userId, CancellationToken cancellationToken)
    {
        var currentLogin = await _context.LoginAudits
            .Where(login => login.UserId == userId && login.LogOutDate == null)
            .OrderByDescending(login => login.LoginDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentLogin is null)
            return;

        currentLogin.LogOutDate = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
