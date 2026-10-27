using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Infrastructure.Identity;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class CompanyEmailTemplateTests
{
    private readonly AccountEmailContentPolicy _policy = new();

    [Theory]
    [InlineData("en")]
    [InlineData("ar")]
    public void Final_MIME_messages_preserve_preview_content_and_have_exactly_one_recipient_without_copies(string language)
    {
        foreach (var definition in AccountEmailCatalog.Definitions)
        {
            var content = _policy.Render(definition.Subject(language), definition.Body(language), language, "Alex", "https://erp.example/action?token=test");
            using var message = PlatformIdentityEmailSender.CreateMessage("recipient@example.test", content,
                new PlatformMailSettings { Mail = "sender@example.test", DisplayName = "ERP" });
            Assert.Single(message.To);
            Assert.Empty(message.Cc);
            Assert.Empty(message.Bcc);
            Assert.Equal(content.Subject, message.Subject);
            Assert.Equal(content.Html, message.HtmlBody);
            Assert.NotNull(message.TextBody);
            Assert.Equal(content.Text.Replace("\r\n", "\n", StringComparison.Ordinal), message.TextBody.Replace("\r\n", "\n", StringComparison.Ordinal));
            Assert.Contains("\n", message.TextBody);
        }
    }

    [Theory]
    [InlineData("en")]
    [InlineData("ar")]
    public void All_registered_defaults_render_with_encoded_identity_and_unchanged_action_link(string language)
    {
        foreach (var definition in AccountEmailCatalog.Definitions)
        {
            var rendered = _policy.Render(definition.Subject(language), definition.Body(language), language,
                "<img src=x onerror=alert(1)>", "https://erp.example/reset?code=a%2Bb&user=10");
            Assert.DoesNotContain("<img", rendered.Html);
            Assert.Contains("&lt;img", rendered.Html);
            Assert.Contains("code=a%2Bb&amp;user=10", rendered.Html);
            Assert.Contains("width=device-width", rendered.Html);
            Assert.Contains(language == "ar" ? "dir=\"rtl\"" : "dir=\"ltr\"", rendered.Html);
            Assert.Contains("https://erp.example/reset?code=a%2Bb&user=10", rendered.Text);
        }
    }

    [Theory]
    [InlineData("<script>alert(1)</script><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<p onclick=\"alert(1)\">Hello</p><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<a href=\"javascript:alert(1)\">Bad</a><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<a href=\"//evil.example\">Bad</a><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<img src=\"https://evil.example/track\"><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<a href=\"https://evil.example/?token={ACTION_URL}\">Go</a>")]
    [InlineData("<p>{ACTION_URL}</p>")]
    [InlineData("<p>{UNKNOWN}</p><a href=\"{ACTION_URL}\">Go</a>")]
    [InlineData("<a href=\"{ACTION_URL}\">Go</a><a href=\"{ACTION_URL}\">Duplicate</a>")]
    [InlineData("<p>Hello</p>")]
    [InlineData("<style>body{color:red}</style><a href=\"{ACTION_URL}\">Go</a>")]
    public void Unsafe_content_and_missing_unknown_or_duplicated_action_tokens_are_rejected(string body) =>
        Assert.Null(_policy.Validate("Subject", body));

    [Fact]
    public void Identity_values_are_not_recursively_interpolated_and_subject_has_no_header_controls()
    {
        var definition = AccountEmailCatalog.Definitions[0];
        var rendered = _policy.Render("Hi {FIRST_NAME}", definition.Body("en"), "en", "{ACTION_URL}\r\nBCC: evil", "https://erp.example/action");
        Assert.Contains("{ACTION_URL}", rendered.Html);
        Assert.DoesNotContain('\r', rendered.Subject);
        Assert.DoesNotContain('\n', rendered.Subject);
        Assert.Null(_policy.Validate("Hi\r\nBcc: evil", definition.Body("en")));
        Assert.Null(_policy.Validate("{ACTION_URL}", definition.Body("en")));
    }

    [Fact]
    public void Customization_revision_is_monotonic_across_reset_and_noops()
    {
        var settings = new CompanyEmailTemplateSettings("tenant-a", 3);
        var definition = AccountEmailCatalog.Definitions[0];
        Assert.True(settings.Change(definition.Id, "en", "Custom", definition.Body("en"), 0, false));
        Assert.Equal(1, settings.Revision);
        Assert.False(settings.Change(definition.Id, "en", "Custom", definition.Body("en"), 1, false));
        Assert.Throws<InvalidOperationException>(() => settings.Change(definition.Id, "en", null, null, 0, true));
        Assert.True(settings.Change(definition.Id, "en", null, null, 1, true));
        Assert.Equal(2, settings.Revision);
        Assert.Empty(settings.Templates);
        Assert.False(settings.Change(definition.Id, "en", null, null, 2, true));
        Assert.Equal(2, settings.Revision);
        Assert.Throws<InvalidOperationException>(() => settings.Change(definition.Id, "en", "Old draft", definition.Body("en"), 0, false));
    }

    [Theory]
    [InlineData("unknown", "en")]
    [InlineData("email-confirmation", "fr")]
    public void Aggregate_denies_unregistered_templates_and_languages(string id, string language)
    {
        var settings = new CompanyEmailTemplateSettings("tenant-a", 3);
        Assert.Throws<ArgumentException>(() => settings.Change(id, language, "Subject", "<p>Body</p>", 0, false));
    }
}
