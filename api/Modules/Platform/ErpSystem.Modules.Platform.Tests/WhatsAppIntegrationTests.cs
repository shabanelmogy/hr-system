using ErpSystem.Modules.Platform.Application.Tenancy.Administration;
using ErpSystem.Modules.Platform.Contracts.Communications;
using ErpSystem.Modules.Platform.Infrastructure.Communications;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using System.Net;
using System.Text;
using System.Text.Json;

namespace ErpSystem.Modules.Platform.Tests;

public sealed class WhatsAppIntegrationTests
{
    [Fact]
    public async Task WapilotSender_ResolvesSingleInstance_AndSendsUsingV2WireContract()
    {
        var handler = new RecordingHandler([
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    "{\"success\":true,\"instances\":[{\"instance_uniquename\":\"erp-main\",\"status\":\"CONNECTED\"}]}",
                    Encoding.UTF8,
                    "application/json")
            },
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    "{\"success\":true,\"message_id\":\"b822f59d-ec46-4d7d-9ab4-9c80bd9cce7f\"}",
                    Encoding.UTF8,
                    "application/json")
            }
        ]);
        using var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.wapilot.net/api/")
        };
        var sender = new WapilotWhatsAppSender(
            client,
            Options.Create(new WapilotOptions
            {
                Enabled = true,
                BaseUrl = "https://api.wapilot.net/api",
                Token = "test-token"
            }),
            NullLogger<WapilotWhatsAppSender>.Instance);

        var result = await sender.SendTextAsync(
            new WhatsAppTextMessage("0020 100 123 4567", "Tenant created", "tenant-created-1"));

        Assert.True(result.Succeeded);
        Assert.Equal("b822f59d-ec46-4d7d-9ab4-9c80bd9cce7f", result.ProviderMessageId);
        Assert.Equal(2, handler.Requests.Count);
        Assert.Equal("https://api.wapilot.net/api/v2/instances", handler.Requests[0].Uri);
        Assert.Equal("Bearer", handler.Requests[0].AuthScheme);
        Assert.Equal("test-token", handler.Requests[0].AuthParameter);
        Assert.Equal("https://api.wapilot.net/api/v2/erp-main/send-message", handler.Requests[1].Uri);
        Assert.Equal("tenant-created-1", handler.Requests[1].IdempotencyKey);
        Assert.Contains("\"chat_id\":\"201001234567@c.us\"", handler.Requests[1].Body, StringComparison.Ordinal);
        Assert.Contains("\"text\":\"Tenant created\"", handler.Requests[1].Body, StringComparison.Ordinal);
        AssertSendAtIsUtc(handler.Requests[1].Body);
    }

    [Fact]
    public async Task WapilotSender_NormalizesLocalPhoneUsingDefaultCountryCallingCode()
    {
        var handler = new RecordingHandler([
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent(
                    "{\"success\":true,\"message_id\":\"local-message\"}",
                    Encoding.UTF8,
                    "application/json")
            }
        ]);
        using var client = new HttpClient(handler)
        {
            BaseAddress = new Uri("https://api.wapilot.net/api/")
        };
        var sender = new WapilotWhatsAppSender(
            client,
            Options.Create(new WapilotOptions
            {
                Enabled = true,
                BaseUrl = "https://api.wapilot.net/api",
                Token = "test-token",
                InstanceId = "erp-main",
                DefaultCountryCallingCode = "20"
            }),
            NullLogger<WapilotWhatsAppSender>.Instance);

        var result = await sender.SendTextAsync(
            new WhatsAppTextMessage("0100 123 4567", "Tenant created", "tenant-created-local"));

        Assert.True(result.Succeeded);
        Assert.Equal("local-message", result.ProviderMessageId);
        var request = Assert.Single(handler.Requests);
        Assert.Equal("https://api.wapilot.net/api/v2/erp-main/send-message", request.Uri);
        Assert.Equal("tenant-created-local", request.IdempotencyKey);
        Assert.Contains("\"chat_id\":\"201001234567@c.us\"", request.Body, StringComparison.Ordinal);
        AssertSendAtIsUtc(request.Body);
    }

    [Fact]
    public async Task CreateTenant_SendsReusableWhatsAppNotification_AfterSuccessfulCreation()
    {
        var tenant = Tenant(contactPhone: "+201001234567");
        var adapter = new FakeTenantManagementAdapter(TenantAdministrationResult.Success(tenant));
        var sender = new FakeWhatsAppSender(WhatsAppSendResult.Failure("provider-test-failure"));
        var handler = new CreateTenantCommandHandler(adapter, sender);

        var result = await handler.Handle(new CreateTenantCommand(Request()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var message = Assert.Single(sender.Messages);
        Assert.Equal(tenant.ContactPhone, message.RecipientPhone);
        Assert.Contains(tenant.Name, message.Message, StringComparison.Ordinal);
        Assert.Contains(tenant.Identifier, message.Message, StringComparison.Ordinal);
    }

    [Fact]
    public async Task CreateTenant_DoesNotSendWhatsApp_WhenContactPhoneIsMissing()
    {
        var adapter = new FakeTenantManagementAdapter(TenantAdministrationResult.Success(Tenant(contactPhone: null)));
        var sender = new FakeWhatsAppSender(WhatsAppSendResult.Success());
        var handler = new CreateTenantCommandHandler(adapter, sender);

        var result = await handler.Handle(new CreateTenantCommand(Request()), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Empty(sender.Messages);
    }

    [Fact]
    public async Task CreateTenant_DoesNotSendWhatsApp_WhenCreationFails()
    {
        var failure = TenantAdministrationResult.Failure<TenantManagementResponse>(
            new TenantAdministrationError(
                "Tenant.TestFailure",
                "Test failure.",
                TenantAdministrationErrorType.Validation));
        var adapter = new FakeTenantManagementAdapter(failure);
        var sender = new FakeWhatsAppSender(WhatsAppSendResult.Success());
        var handler = new CreateTenantCommandHandler(adapter, sender);

        var result = await handler.Handle(new CreateTenantCommand(Request()), CancellationToken.None);

        Assert.True(result.IsFailure);
        Assert.Empty(sender.Messages);
    }

    private static TenantManagementRequest Request() => new(
        "acme",
        "Acme",
        true,
        "active",
        new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2027, 9, 15, 0, 0, 0, DateTimeKind.Utc),
        "Business",
        2,
        20,
        "billing@example.com",
        "Owner",
        "+201001234567",
        null);

    private static void AssertSendAtIsUtc(string body)
    {
        using var document = JsonDocument.Parse(body);
        var sendAt = document.RootElement.GetProperty("send_at").GetString();

        Assert.NotNull(sendAt);
        Assert.EndsWith("Z", sendAt, StringComparison.Ordinal);
    }

    private static TenantManagementResponse Tenant(string? contactPhone) => new(
        "tenant-1",
        "acme",
        "Acme",
        true,
        "active",
        new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc),
        new DateTime(2027, 9, 15, 0, 0, 0, DateTimeKind.Utc),
        "Business",
        2,
        20,
        0,
        0,
        0,
        1,
        "billing@example.com",
        "Owner",
        contactPhone,
        null,
        new DateTime(2026, 9, 15, 0, 0, 0, DateTimeKind.Utc),
        null,
        "active",
        null,
        null,
        null,
        "row-version");

    private sealed class FakeWhatsAppSender(WhatsAppSendResult result) : IWhatsAppSender
    {
        public List<WhatsAppTextMessage> Messages { get; } = [];

        public Task<WhatsAppSendResult> SendTextAsync(
            WhatsAppTextMessage message,
            CancellationToken cancellationToken = default)
        {
            Messages.Add(message);
            return Task.FromResult(result);
        }
    }

    private sealed class FakeTenantManagementAdapter(
        TenantAdministrationResult<TenantManagementResponse> createResult) : ITenantManagementAdapter
    {
        public Task<TenantAdministrationResult<TenantManagementResponse>> CreateAsync(
            TenantManagementRequest request,
            CancellationToken cancellationToken = default) => Task.FromResult(createResult);

        public Task<TenantAdministrationPage<TenantManagementResponse>> GetPageAsync(
            TenantAdministrationPageRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<IReadOnlyList<TenantManagementResponse>> GetAllAsync(
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<TenantAdministrationResult<TenantManagementResponse>> GetAsync(
            string id,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<TenantAdministrationResult<TenantManagementResponse>> UpdateAsync(
            string id,
            TenantManagementRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<TenantAdministrationResult<TenantManagementResponse>> ArchiveAsync(
            string id,
            ArchiveTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();

        public Task<TenantAdministrationResult<TenantManagementResponse>> RestoreAsync(
            string id,
            RestoreTenantRequest request,
            CancellationToken cancellationToken = default) => throw new NotSupportedException();
    }

    private sealed class RecordingHandler(Queue<HttpResponseMessage> responses) : HttpMessageHandler
    {
        public RecordingHandler(IEnumerable<HttpResponseMessage> responses) : this(new Queue<HttpResponseMessage>(responses))
        {
        }

        public List<RecordedRequest> Requests { get; } = [];

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            Requests.Add(new RecordedRequest(
                request.RequestUri?.AbsoluteUri ?? string.Empty,
                request.Headers.Authorization?.Scheme,
                request.Headers.Authorization?.Parameter,
                request.Headers.TryGetValues("Idempotency-Key", out var values) ? values.SingleOrDefault() : null,
                request.Content is null
                    ? string.Empty
                    : await request.Content.ReadAsStringAsync(cancellationToken)));
            return responses.Dequeue();
        }
    }

    private sealed record RecordedRequest(
        string Uri,
        string? AuthScheme,
        string? AuthParameter,
        string? IdempotencyKey,
        string Body);
}
