using QRCoder;

namespace HrManagementSystem.Features.Finance.Invoicing.Controllers.V1;

[ApiVersion("1.0")]
[ApiController]
[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
public class InvoiceController : ControllerBase
{
    [HttpPost("generate-qr")]
    public IActionResult GenerateQrCode([FromBody] InvoiceRequest request)
    {
        var rawData = GenerateZatcaQrCode(request);
        var image = GenerateQrImage(rawData);
        var base64Image = Convert.ToBase64String(image);

        return Ok(new
        {
            success = true,
            qrCodeBase64 = base64Image,
            qrCodeDataUrl = $"data:image/png;base64,{base64Image}",
            rawData
        });
    }

    [HttpPost("generate-qr-image")]
    public IActionResult GenerateQrCodeImage([FromBody] InvoiceRequest request)
    {
        var rawData = GenerateZatcaQrCode(request);
        return File(GenerateQrImage(rawData), "image/png", "invoice-qr.png");
    }

    private static byte[] GenerateQrImage(string rawData)
    {
        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(rawData, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);
        return qrCode.GetGraphic(20);
    }

    private static string GenerateZatcaQrCode(InvoiceRequest request)
    {
        var tlvData = new List<byte>();
        AddTlv(tlvData, 1, request.SellerName);
        AddTlv(tlvData, 2, request.VatRegistrationNumber);
        AddTlv(tlvData, 3, request.InvoiceTimestamp);
        AddTlv(tlvData, 4, request.InvoiceTotal.ToString("0.00", CultureInfo.InvariantCulture));
        AddTlv(tlvData, 5, request.VatTotal.ToString("0.00", CultureInfo.InvariantCulture));
        return Convert.ToBase64String(tlvData.ToArray());
    }

    private static void AddTlv(List<byte> data, byte tag, string value)
    {
        var valueBytes = Encoding.UTF8.GetBytes(value);
        data.Add(tag);
        data.Add((byte)valueBytes.Length);
        data.AddRange(valueBytes);
    }
}

public sealed record InvoiceRequest(
    string SellerName,
    string VatRegistrationNumber,
    string InvoiceTimestamp,
    decimal InvoiceTotal,
    decimal VatTotal);

public sealed class InvoiceRequestValidator : AbstractValidator<InvoiceRequest>
{
    public InvoiceRequestValidator(IStringLocalizer<InvoiceRequest> localizer)
    {
        RuleFor(request => request.SellerName)
            .Trimmed()
            .NotEmpty()
            .WithMessage(localizer[Strings.Required])
            .Must(value => Encoding.UTF8.GetByteCount(value) <= byte.MaxValue)
            .WithMessage(localizer[Strings.MaxLengthError]);

        RuleFor(request => request.VatRegistrationNumber)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required])
            .Matches("^[0-9]{15}$")
            .WithMessage(localizer[Strings.InvalidValues]);

        RuleFor(request => request.InvoiceTimestamp)
            .NotEmpty()
            .WithMessage(localizer[Strings.Required])
            .Must(value => DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.RoundtripKind, out _))
            .WithMessage(localizer[Strings.InvalidValues]);

        RuleFor(request => request.InvoiceTotal)
            .GreaterThan(0)
            .WithMessage(localizer[Strings.GreaterThanZero]);

        RuleFor(request => request.VatTotal)
            .GreaterThanOrEqualTo(0)
            .LessThanOrEqualTo(request => request.InvoiceTotal)
            .WithMessage(localizer[Strings.InvalidValues]);
    }
}
