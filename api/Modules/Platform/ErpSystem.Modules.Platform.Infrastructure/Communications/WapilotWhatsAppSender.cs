using System.Globalization;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.RegularExpressions;
using ErpSystem.Modules.Platform.Contracts.Communications;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace ErpSystem.Modules.Platform.Infrastructure.Communications;

public sealed class WapilotWhatsAppSender(
    HttpClient httpClient,
    IOptions<WapilotOptions> options,
    ILogger<WapilotWhatsAppSender> logger) : IWhatsAppSender
{
    private static readonly Regex NonDigits = new("[^0-9]", RegexOptions.Compiled | RegexOptions.CultureInvariant);
    private static readonly Action<ILogger, int, Exception?> ProviderRejected =
        LoggerMessage.Define<int>(
            LogLevel.Warning,
            new EventId(1, nameof(ProviderRejected)),
            "WAPilot WhatsApp send failed with status code {StatusCode}.");

    private static readonly Action<ILogger, Exception?> ProviderTimedOut =
        LoggerMessage.Define(
            LogLevel.Warning,
            new EventId(2, nameof(ProviderTimedOut)),
            "WAPilot WhatsApp send timed out.");

    private static readonly Action<ILogger, Exception?> ProviderUnavailable =
        LoggerMessage.Define(
            LogLevel.Warning,
            new EventId(3, nameof(ProviderUnavailable)),
            "WAPilot WhatsApp send failed.");

    private readonly WapilotOptions _options = options.Value;

    public async Task<WhatsAppSendResult> SendTextAsync(
        WhatsAppTextMessage message,
        CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled)
            return WhatsAppSendResult.Failure("WhatsApp.Disabled");

        var phone = message.RecipientPhone.Trim();
        var text = message.Message.Trim();
        if (phone.Length == 0 || text.Length == 0)
            return WhatsAppSendResult.Failure("WhatsApp.InvalidMessage");

        var digits = NormalizePhoneNumber(phone);
        if (digits.Length < 8)
            return WhatsAppSendResult.Failure("WhatsApp.InvalidRecipient");

        var resolvedInstance = await ResolveInstanceIdAsync(cancellationToken).ConfigureAwait(false);
        if (resolvedInstance.ErrorCode is not null)
            return WhatsAppSendResult.Failure(resolvedInstance.ErrorCode);

        var endpoint = $"v2/{Uri.EscapeDataString(resolvedInstance.InstanceId!)}/send-message";
        using var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
        {
            Content = JsonContent.Create(new
            {
                chat_id = $"{digits}@c.us",
                text,
                send_at = DateTime.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss'Z'", CultureInfo.InvariantCulture)
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.Token);
        if (!string.IsNullOrWhiteSpace(message.IdempotencyKey))
            request.Headers.TryAddWithoutValidation("Idempotency-Key", message.IdempotencyKey.Trim());

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                ProviderRejected(logger, (int)response.StatusCode, null);
                return WhatsAppSendResult.Failure($"WhatsApp.Provider.{(int)response.StatusCode}");
            }

            return WhatsAppSendResult.Success(await TryReadMessageIdAsync(response, cancellationToken).ConfigureAwait(false));
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            ProviderTimedOut(logger, null);
            return WhatsAppSendResult.Failure("WhatsApp.Timeout");
        }
        catch (HttpRequestException exception)
        {
            ProviderUnavailable(logger, exception);
            return WhatsAppSendResult.Failure("WhatsApp.ProviderUnavailable");
        }
    }

    private string NormalizePhoneNumber(string phone)
    {
        var digits = NonDigits.Replace(phone, string.Empty);
        if (digits.StartsWith("00", StringComparison.Ordinal))
            return digits[2..];

        if (digits.StartsWith('0'))
            return _options.DefaultCountryCallingCode + digits[1..];

        return digits;
    }

    private async Task<(string? InstanceId, string? ErrorCode)> ResolveInstanceIdAsync(
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(_options.InstanceId))
            return (_options.InstanceId.Trim(), null);

        using var request = new HttpRequestMessage(HttpMethod.Get, "v2/instances");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.Token);

        try
        {
            using var response = await httpClient.SendAsync(request, cancellationToken).ConfigureAwait(false);
            if (!response.IsSuccessStatusCode)
            {
                ProviderRejected(logger, (int)response.StatusCode, null);
                return (null, $"WhatsApp.Provider.{(int)response.StatusCode}");
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken).ConfigureAwait(false);
            if (!document.RootElement.TryGetProperty("instances", out var instances) ||
                instances.ValueKind != JsonValueKind.Array)
            {
                return (null, "WhatsApp.InvalidProviderResponse");
            }

            var ids = instances
                .EnumerateArray()
                .Select(item => item.TryGetProperty("instance_uniquename", out var value) && value.ValueKind == JsonValueKind.String
                    ? value.GetString()
                    : null)
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Distinct(StringComparer.Ordinal)
                .ToArray();

            return ids.Length switch
            {
                0 => (null, "WhatsApp.InstanceNotConfigured"),
                1 => (ids[0], null),
                _ => (null, "WhatsApp.InstanceAmbiguous")
            };
        }
        catch (OperationCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            ProviderTimedOut(logger, null);
            return (null, "WhatsApp.Timeout");
        }
        catch (HttpRequestException exception)
        {
            ProviderUnavailable(logger, exception);
            return (null, "WhatsApp.ProviderUnavailable");
        }
        catch (JsonException)
        {
            return (null, "WhatsApp.InvalidProviderResponse");
        }
    }

    private static async Task<string?> TryReadMessageIdAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        try
        {
            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken).ConfigureAwait(false);
            using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken).ConfigureAwait(false);
            if (document.RootElement.TryGetProperty("message_id", out var value) && value.ValueKind == JsonValueKind.String)
                return value.GetString();
        }
        catch (JsonException)
        {
            // Successful provider responses do not need an id for our generic contract.
        }

        return null;
    }
}
