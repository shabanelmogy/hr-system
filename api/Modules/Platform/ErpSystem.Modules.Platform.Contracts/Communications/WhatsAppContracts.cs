namespace ErpSystem.Modules.Platform.Contracts.Communications;

public sealed record WhatsAppTextMessage(
    string RecipientPhone,
    string Message,
    string? IdempotencyKey = null);

public sealed record WhatsAppSendResult(
    bool Succeeded,
    string? ProviderMessageId = null,
    string? ErrorCode = null)
{
    public static WhatsAppSendResult Success(string? providerMessageId = null) =>
        new(true, providerMessageId);

    public static WhatsAppSendResult Failure(string errorCode) =>
        new(false, ErrorCode: errorCode);
}

public interface IWhatsAppSender
{
    Task<WhatsAppSendResult> SendTextAsync(
        WhatsAppTextMessage message,
        CancellationToken cancellationToken = default);
}
