namespace HrManagementSystem.Infrastructure.Localization
{
    public class CultureMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task InvokeAsync(HttpContext context)
        {
            var currentLanguage = context.Request.Headers["Culture"].FirstOrDefault()?[..2];
            //var currentLanguage = context.Request.Cookies["clientCulture"]?[..2] ?? "en"; 

            if (!string.IsNullOrEmpty(currentLanguage))
            {
                string? culture;
                switch (currentLanguage)
                {
                    case "ar":
                        culture = "ar-EG";
                        break;

                    default:
                        culture = "en-US";
                        break;
                }

                var requestCulture = new RequestCulture(culture, culture);
                context.Features.Set<IRequestCultureFeature>(new RequestCultureFeature(requestCulture, null));

                CultureInfo.CurrentCulture = new CultureInfo(culture);
                CultureInfo.CurrentUICulture = new CultureInfo(culture);
            }

            await _next(context);
        }
    }
}


