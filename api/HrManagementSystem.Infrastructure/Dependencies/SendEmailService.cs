namespace HrManagementSystem.Infrastructure.Dependencies;

public static class SendEmailService
{
    public static IServiceCollection AddSendEmailService(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<MailSettings>()
            .BindConfiguration(nameof(MailSettings))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services;
    }
}
