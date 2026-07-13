namespace HrManagementSystem.Shared.Services;

public class NotificationService(
    ApplicationDbContext context,
    UserManager<ApplicationUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IEmailSender emailSender) : INotificationService
{
    private readonly ApplicationDbContext _context = context;
    private readonly UserManager<ApplicationUser> _userManager = userManager;
    private readonly IHttpContextAccessor _httpContextAccessor = httpContextAccessor;
    private readonly IEmailSender _emailSender = emailSender;

    public async Task SendNewCompanyNotification(int? companyId)
    {
        //    IEnumerable<Company> companies = [];

        //    if (companyId.HasValue)
        //    {
        //        var company = await _context.Companies.SingleOrDefaultAsync(x => x.Id == companyId);

        //        companies = [company!];
        //    }
        //    else
        //    {
        //        companies = await _context.Companies
        //            .AsNoTracking()
        //            .ToListAsync();
        //    }

        //    //TODO: Select members only
        //    var users = await _userManager.Users.ToListAsync();

        //    var origin = _httpContextAccessor.HttpContext?.Request.Headers.Origin;

        //    foreach (var company in companies)
        //    {
        //        foreach (var user in users)
        //        {
        //            var placeholders = new Dictionary<string, string>
        //            {
        //                { "{{name}}", user.FirstName },
        //                { "{{companyName}}", company.NameAr },
        //                { "{{url}}", $"{origin}/companies/{company.Id}" }
        //            };

        //            var body = EmailBodyBuilder.GenerateEmailBody("CompaniesNotification", placeholders);

        //            await _emailSender.SendEmailAsync(user.Email!, $"?? TechnicalSupport: New Company - {company.NameAr}", body);
        //        }
        //    }
    }
}
