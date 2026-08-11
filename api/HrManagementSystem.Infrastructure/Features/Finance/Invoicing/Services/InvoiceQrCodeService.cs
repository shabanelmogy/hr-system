using HrManagementSystem.Application.Features.Finance.Invoicing.Contracts;
using HrManagementSystem.Application.Features.Finance.Invoicing.Services;
using QRCoder;

namespace HrManagementSystem.Infrastructure.Features.Finance.Invoicing.Services;

public sealed class InvoiceQrCodeService : IInvoiceQrCodeService
{
    public InvoiceQrCodeResult Generate(InvoiceRequest request)
    {
        var rawData = GenerateZatcaQrCode(request);

        using var qrGenerator = new QRCodeGenerator();
        using var qrCodeData = qrGenerator.CreateQrCode(rawData, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(qrCodeData);

        return new InvoiceQrCodeResult(rawData, qrCode.GetGraphic(20));
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
