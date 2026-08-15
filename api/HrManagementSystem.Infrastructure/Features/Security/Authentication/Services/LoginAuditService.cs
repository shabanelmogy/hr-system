using HrManagementSystem.Application.Features.Security.Authentication.Services;
using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Services;

public class LoginAuditService(ApplicationDbContext context) : ILoginAuditService
{
    private readonly ApplicationDbContext _context = context;

    public async Task RecordLoginAsync(
        string userId,
        int companyId,
        CancellationToken cancellationToken)
    {
        var tenantId = await _context.Companies
            .IgnoreQueryFilters()
            .Where(company => company.Id == companyId)
            .Select(company => company.TenantId)
            .SingleAsync(cancellationToken);

        _context.Add(new UserLogin
        {
            TenantId = tenantId,
            CompanyId = companyId,
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            LoginDate = DateTime.UtcNow
        });

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task RecordLogoutAsync(
        string userId,
        int companyId,
        CancellationToken cancellationToken)
    {
        var tenantId = await _context.Companies
            .IgnoreQueryFilters()
            .Where(company => company.Id == companyId)
            .Select(company => company.TenantId)
            .SingleOrDefaultAsync(cancellationToken);

        if (string.IsNullOrWhiteSpace(tenantId))
            return;

        var currentLogin = await _context.LoginAudits
            .IgnoreQueryFilters()
            .Where(login =>
                login.TenantId == tenantId &&
                login.CompanyId == companyId &&
                login.UserId == userId &&
                login.LogOutDate == null)
            .OrderByDescending(login => login.LoginDate)
            .FirstOrDefaultAsync(cancellationToken);

        if (currentLogin is null)
            return;

        currentLogin.LogOutDate = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }
}
