using System.Net;
using AngleSharp.Html.Parser;
using Ganss.Xss;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Domain.Companies.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;

public sealed class AccountEmailContentPolicy : IAccountEmailContentPolicy
{
    private static readonly HashSet<string> Tags = new(StringComparer.OrdinalIgnoreCase)
        { "p", "br", "strong", "em", "u", "s", "blockquote", "h1", "h2", "h3", "ul", "ol", "li", "hr", "a", "code", "pre", "span" };
    private const string ActionMarker = "https://example.invalid/erp-template-action-placeholder";

    public ValidatedEmailContent? Validate(string subject, string body)
    {
        if (!AccountEmailCatalog.IsValidContent(subject, body)) return null;
        var document = new HtmlParser().ParseDocument(body);
        var root = document.Body!;
        if (document.Head!.Children.Length != 0 || root.TextContent.Contains("{ACTION_URL}", StringComparison.Ordinal)) return null;
        var actions = 0;
        foreach (var element in root.QuerySelectorAll("*"))
        {
            if (!Tags.Contains(element.LocalName)) return null;
            foreach (var attribute in element.Attributes)
            {
                if (element.LocalName != "a" || attribute.Name != "href") return null;
                if (attribute.Value == "{ACTION_URL}") { actions++; continue; }
                if (attribute.Value.Contains('{') || attribute.Value.Contains('}') ||
                    !Uri.TryCreate(attribute.Value, UriKind.Absolute, out var link) || link.Scheme != Uri.UriSchemeHttps ||
                    !string.IsNullOrEmpty(link.UserInfo)) return null;
            }
        }
        if (actions != 1) return null;
        var sanitizer = new HtmlSanitizer();
        sanitizer.AllowedTags.Clear(); foreach (var tag in Tags) sanitizer.AllowedTags.Add(tag);
        sanitizer.AllowedAttributes.Clear(); sanitizer.AllowedAttributes.Add("href");
        sanitizer.AllowedSchemes.Clear(); sanitizer.AllowedSchemes.Add("https");
        var html = sanitizer.Sanitize(root.InnerHtml.Replace("{ACTION_URL}", ActionMarker, StringComparison.Ordinal))
            .Replace(ActionMarker, "{ACTION_URL}", StringComparison.Ordinal);
        return AccountEmailCatalog.IsValidContent(subject, html) ? new(subject, html) : null;
    }

    public RenderedAccountEmail Render(string subject, string body, string language, string name, string actionUrl)
    {
        var content = Validate(subject, body) ?? throw new InvalidOperationException("Unsafe account email template.");
        if (!AccountEmailCatalog.IsLanguage(language) || !Uri.TryCreate(actionUrl, UriKind.Absolute, out var url) ||
            (url.Scheme != Uri.UriSchemeHttps && !(url.Scheme == Uri.UriSchemeHttp && url.IsLoopback)))
            throw new InvalidOperationException("Invalid account email rendering context.");
        var safeName = new string(name.Where(c => !char.IsControl(c)).ToArray());
        var renderedSubject = content.Subject.Replace("{FIRST_NAME}", safeName, StringComparison.Ordinal);
        var html = content.Body.Replace("{ACTION_URL}", WebUtility.HtmlEncode(actionUrl), StringComparison.Ordinal)
            .Replace("{FIRST_NAME}", WebUtility.HtmlEncode(safeName), StringComparison.Ordinal);
        var plain = new HtmlParser().ParseDocument(html);
        foreach (var paragraph in plain.Body!.QuerySelectorAll("p,h1,h2,h3,li,blockquote"))
            paragraph.AppendChild(plain.CreateTextNode("\n"));
        var text = plain.Body.TextContent.Trim() + "\n" + actionUrl;
        return new(renderedSubject, $"<!doctype html><html lang=\"{language}\" dir=\"{(language == "ar" ? "rtl" : "ltr")}\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"></head><body>{html}</body></html>", text);
    }
}
