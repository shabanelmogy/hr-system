namespace HrManagementSystem.Infrastructure.Dependencies;

public static class SendEmailService
{
    public static IServiceCollection AddSendEmailService(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<MailSettings>(configuration.GetSection(nameof(MailSettings)));

        return services;
    }
}
