using System.Globalization;
using ErpSystem.Api.Hosting.Localization;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;

namespace ErpSystem.IntegrationTests;

public sealed class HostLocalizationOwnershipTests
{
    [Theory]
    [InlineData("en-US", "Save")]
    [InlineData("ar-EG", "حفظ")]
    public void HostLocalizer_ReadsTheSharedCommentedJsonCatalog(string cultureName, string expected)
    {
        var originalCulture = CultureInfo.CurrentCulture;
        var originalUiCulture = CultureInfo.CurrentUICulture;
        try
        {
            CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo(cultureName);
            CultureInfo.CurrentUICulture = CultureInfo.GetCultureInfo(cultureName);

            var services = new ServiceCollection();
            services.AddDistributedMemoryCache();
            using var provider = services.BuildServiceProvider();
            var localizer = new HostJsonStringLocalizer(
                provider.GetRequiredService<IDistributedCache>());

            Assert.Equal(expected, localizer["Save"].Value);
        }
        finally
        {
            CultureInfo.CurrentCulture = originalCulture;
            CultureInfo.CurrentUICulture = originalUiCulture;
        }
    }
}
