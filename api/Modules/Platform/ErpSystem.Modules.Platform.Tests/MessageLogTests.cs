using ClosedXML.Excel;
using ErpSystem.BuildingBlocks.Context.Authentication;
using ErpSystem.Modules.Platform.Application.CompanyAccess;
using ErpSystem.Modules.Platform.Application.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Application.Features.MessageLogs;
using ErpSystem.Modules.Platform.Domain.Platform.MessageLogs;
using ErpSystem.Modules.Platform.Infrastructure;
using ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;
using ErpSystem.Modules.Platform.Infrastructure.Features.MessageLogs;
using ErpSystem.Modules.Platform.Infrastructure.Identity;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using MimeKit;
using Xunit;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class MessageLogTests
{
    private static readonly DateTime Started = new(2026, 10, 21, 12, 0, 0, DateTimeKind.Utc);
    private static MessageLogEntry Entry(string recipient = "recipient@example.test") =>
        MessageLogEntry.Start(Guid.NewGuid(), "tenant", 1, "user", "correlation", Started, "password-reset", "en", recipient);

    [Fact]
    public void DomainSnapshotAndTerminalOutcomeAreImmutable()
    {
        var value = Entry(); value.SetSnapshot("Subject", "<p>Safe</p>", false);
        Assert.True(value.Complete(Started.AddSeconds(1), 1000, "accepted", "disconnect", null, null));
        Assert.False(value.Complete(Started.AddSeconds(2), 2000, "failed", "send", "rejected", 550));
        Assert.Equal("accepted", value.Status); Assert.Equal(1000, value.DurationMs);
        Assert.Throws<InvalidOperationException>(() => value.SetSnapshot("Changed", "<p>Changed</p>", false));
        Assert.Throws<ArgumentException>(() => Entry().Complete(Started, -1, "delivered", "send", null, null));
    }

    [Fact]
    public void SnapshotNeverStoresLiveAccountLinkAndBoundsWithoutSplittingMarkup()
    {
        const string action = "https://app.example.test/reset?code=TOP_SECRET&email=user@example.test";
        var policy = new AccountEmailContentPolicy();
        var rendered = policy.Render("Welcome {FIRST_NAME}", "<p>{FIRST_NAME}</p><a href=\"{ACTION_URL}\">Continue</a><a href=\"https://example.test/\">Help</a>", "en", "<img src=x>", action);
        var value = MessageSnapshotPolicy.Redact(rendered.Subject, rendered.Html, action);
        Assert.DoesNotContain("TOP_SECRET", value.Html); Assert.DoesNotContain("href", value.Html);
        Assert.Contains("lang=\"en\"", value.Html); Assert.Contains("name=\"viewport\"", value.Html);
        var arabic = MessageSnapshotPolicy.Redact("Subject", rendered.Html.Replace("lang=\"en\"", "lang=\"ar\""), action);
        Assert.Contains("dir=\"rtl\"", arabic.Html);
        Assert.Contains("&lt;img", value.Html); Assert.False(value.Truncated);
        var longValue = MessageSnapshotPolicy.Redact(new string('x', 600), "<p>" + new string('&', 70000) + "</p>", action);
        Assert.True(longValue.Truncated); Assert.Equal(512, longValue.Subject.Length); Assert.True(longValue.Html.Length <= 65536);
        var hostile = MessageSnapshotPolicy.Redact("subject", "<p onclick=evil()>Safe</p><script>SECRET</script><img src=https://tracking.test>", action);
        Assert.DoesNotContain("script", hostile.Html); Assert.DoesNotContain("onclick", hostile.Html); Assert.DoesNotContain("img", hostile.Html);
    }

    [Theory]
    [InlineData("success", "accepted", null)]
    [InlineData("configuration", "failed", "disabled")]
    [InlineData("connect", "failed", "connection")]
    [InlineData("authenticate", "failed", "authentication")]
    [InlineData("reject", "failed", "rejected")]
    [InlineData("send", "uncertain", "communication")]
    [InlineData("cancel-connect", "cancelled", "cancelled")]
    [InlineData("cancel-send", "uncertain", "cancelled")]
    [InlineData("disconnect", "accepted", null)]
    public async Task ActualSenderRecordsTruthfulOutcomeWithoutReplayOrLiveSecrets(string failure, string expected, string? cause)
    {
        var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        var recorder = new MessageAttemptRecorder(options, NullLogger<MessageAttemptRecorder>.Instance);
        var transport = new Transport(failure);
        var sender = Sender(recorder, transport, new ScopeResolver(), failure != "configuration");
        try { await sender.SendInvitationAsync("recipient@example.test", "Name", Guid.NewGuid(), "TOKEN_SECRET", "tenant", 1, CancellationToken.None); }
        catch (Exception) when (failure != "success") { }
        await using var db = new PlatformDbContext(options);
        var entry = Assert.Single(await db.MessageLogEntries.IgnoreQueryFilters().ToArrayAsync());
        Assert.Equal(expected, entry.Status); Assert.Equal(cause, entry.Cause);
        Assert.DoesNotContain("TOKEN_SECRET", entry.SnapshotHtml ?? "");
        Assert.DoesNotContain("smtp-secret", entry.SnapshotHtml ?? "");
        Assert.Equal(failure == "configuration" ? 0 : 1, transport.Calls);
        Assert.NotNull(entry.CompletedOnUtc);
        if (failure == "reject") Assert.Equal(550, entry.SmtpStatusCode);
    }

    [Fact]
    public async Task UnattributedSendsAreNeverAssignedToACompany()
    {
        var recorder = new UnavailableRecorder(); var transport = new Transport("success");
        var sender = Sender(recorder, transport, new ScopeResolver(false));
        await sender.SendPasswordResetAsync(new PlatformApplicationUser { Id = "user", Email = "recipient@example.test", FirstName = "Name" }, "TOKEN_SECRET", CancellationToken.None);
        Assert.Equal(0, recorder.Starts); Assert.Equal(1, transport.Calls);
    }

    [Fact]
    public async Task CaptureUnavailableCannotInvalidateSuccessfulMail()
    {
        var recorder = new UnavailableRecorder(); var transport = new Transport("success");
        await Sender(recorder, transport, new ScopeResolver()).SendInvitationAsync("recipient@example.test", "Name", Guid.NewGuid(), "secret", "tenant", 1, CancellationToken.None);
        Assert.Equal(1, recorder.Starts); Assert.Equal(1, transport.Calls);
    }

    [Fact]
    public async Task ScopedListDetailAndExcelExcludeOtherCompanyAndNeverExportSnapshot()
    {
        var actor = new Actor(); var options = new DbContextOptionsBuilder<PlatformDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        await using var db = new PlatformDbContext(options, actor);
        var first = Entry(); first.SetSnapshot("=formula", "<p>PRIVATE_SNAPSHOT</p>", false);
        first.Complete(Started, 0, "accepted", "disconnect", null, null); db.MessageLogEntries.Add(first);
        db.Users.Add(new PlatformApplicationUser { Id = "user", UserName = "user" });
        db.Tenants.Add(new PlatformTenant("tenant", "tenant", "Tenant", Started));
        await db.SaveChangesAsync();
        await using (var isolated = new PlatformDbContext(options))
        { var foreign = MessageLogEntry.Start(Guid.NewGuid(), "other", 2, "u", null, Started, "password-reset", "en", "foreign@example.test"); isolated.MessageLogEntries.Add(foreign); await isolated.SaveChangesAsync(); }
        var reader = new MessageLogReader(db, actor, new AvailableCompany()); Assert.True(await reader.HasScopeAsync(CancellationToken.None));
        var page = await reader.ListAsync(new(Status: "accepted"), CancellationToken.None);
        Assert.Equal(1, page.TotalCount); Assert.Equal(DateTimeKind.Utc, page.Items[0].StartedOnUtc.Kind);
        Assert.Null(await reader.DetailAsync(Guid.NewGuid(), CancellationToken.None));
        var detail = await reader.DetailAsync(first.Id, CancellationToken.None); Assert.Contains("PRIVATE_SNAPSHOT", detail!.SnapshotHtml);
        var export = await reader.ExportAsync(new(), CancellationToken.None); using var stream = new MemoryStream(export!.Contents);
        using var workbook = new XLWorkbook(stream); var sheet = workbook.Worksheet(1);
        Assert.Equal("=formula", sheet.Cell(2, 7).GetString()); Assert.True(sheet.Cell(2, 7).Style.IncludeQuotePrefix); Assert.False(sheet.Cell(2, 7).HasFormula);
        Assert.Equal(2, sheet.LastRowUsed()!.RowNumber());
        Assert.DoesNotContain("PRIVATE_SNAPSHOT", string.Join("|", sheet.CellsUsed().Select(cell => cell.GetString())));
        actor.Global = true; Assert.False(await reader.HasScopeAsync(CancellationToken.None));
    }

    [Fact]
    public void QueryCriteriaRejectInvalidRangesScopesAndExcessivePages()
    {
        var validator = new MessageLogCriteriaValidator();
        Assert.True(validator.Validate(new MessageLogCriteria()).IsValid);
        Assert.False(validator.Validate(new MessageLogCriteria(FromUtc: Started.AddDays(1), ToUtc: Started)).IsValid);
        Assert.False(validator.Validate(new MessageLogCriteria(Status: "delivered", TemplateId: "unknown", Page: 0, PageSize: 101)).IsValid);
        Assert.False(validator.Validate(new MessageLogCriteria(FromUtc: DateTime.SpecifyKind(Started, DateTimeKind.Unspecified))).IsValid);
    }

    private static PlatformIdentityEmailSender Sender(IMessageAttemptRecorder recorder, IPlatformSmtpTransport transport, IAccountEmailScopeResolver resolver, bool enabled = true) =>
        new(Options.Create(new PlatformMailSettings { Enabled = enabled, Mail = "sender@example.test", DisplayName = "ERP", Password = "smtp-secret", Host = "smtp.example.test", Port = 465 }),
            Options.Create(new PlatformPublicApplicationSettings { FrontendUrl = "https://app.example.test" }), new Renderer(), resolver, recorder, transport, TimeProvider.System, new Actor());
    private sealed class Actor : ICurrentActor
    { public string? UserId => "user"; public string? TenantId => "tenant"; public int? CompanyId => 1; public bool Global { get; set; } public bool IsInRole(string role) => Global && role == "super_admin"; }
    private sealed class ScopeResolver(bool known = true) : IAccountEmailScopeResolver
    { public Task<AccountEmailScope?> ResolveAsync(string? tenantId, int? companyId, string? recipientUserId, CancellationToken token) => Task.FromResult(known ? new AccountEmailScope("tenant", 1) : null); }
    private sealed class Renderer : IAccountEmailRenderer
    {
        public Task<RenderedAccountEmail> RenderAsync(string templateId, string language, string name, string actionUrl, string? trustedTenantId, int? trustedCompanyId, CancellationToken token, string? recipientUserId = null) =>
            Task.FromResult(new AccountEmailContentPolicy().Render("Hello {FIRST_NAME}", "<p>{FIRST_NAME}</p><a href=\"{ACTION_URL}\">Continue</a>", language, name, actionUrl));
    }
    private sealed class Transport(string failure) : IPlatformSmtpTransport
    {
        public int Calls { get; private set; }
        public Task SendAsync(MimeMessage message, PlatformMailSettings settings, Action<string> stage, CancellationToken token)
        {
            Calls++;
            foreach (var step in new[] { "connect", "authenticate", "send", "accepted", "disconnect" })
            {
                stage(step);
                if (failure == "cancel-" + step) throw new OperationCanceledException();
                if (failure == "reject" && step == "send") throw new SmtpCommandException(SmtpErrorCode.MessageNotAccepted, SmtpStatusCode.MailboxUnavailable, "PRIVATE_PROVIDER_TEXT");
                if (failure == step) throw new IOException("PRIVATE_PROVIDER_TEXT TOKEN_SECRET");
            }
            Assert.Contains("https://app.example.test/", message.HtmlBody ?? "");
            return Task.CompletedTask;
        }
    }
    private sealed class UnavailableRecorder : IMessageAttemptRecorder
    {
        public int Starts { get; private set; }
        public Task<Guid?> StartAsync(MessageAttemptStart attempt) { Starts++; return Task.FromResult<Guid?>(null); }
        public Task SnapshotAsync(Guid id, MessageAttemptStart attempt, MessageAttemptSnapshot snapshot) => throw new InvalidOperationException();
        public Task CompleteAsync(Guid id, MessageAttemptStart attempt, MessageAttemptCompletion completion) => throw new InvalidOperationException();
    }
    private sealed class AvailableCompany : ICompanyAccessService
    {
        public Task<IReadOnlyList<CompanyAccessOption>> GetAvailableCompaniesAsync(string userId, string tenantId, CancellationToken cancellationToken = default) => throw new NotSupportedException();
        public Task<CompanyAccessOption?> GetAvailableCompanyAsync(string userId, string tenantId, int companyId, CancellationToken cancellationToken = default) => Task.FromResult<CompanyAccessOption?>(new(1, "ONE", "واحد", "One"));
    }
}
