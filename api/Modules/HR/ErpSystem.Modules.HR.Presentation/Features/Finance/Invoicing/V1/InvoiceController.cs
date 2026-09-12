using ErpSystem.Modules.HR.Application.Features.Finance.Invoicing.Contracts;
using ErpSystem.Modules.HR.Application.Features.Finance.Invoicing.Services;

namespace ErpSystem.Modules.HR.Presentation.Features.Finance.Invoicing.V1;

[ApiVersion("1.0")]
[ApiController]
[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
[TenantMember]
[AllowTenantReadOnly]
public sealed class InvoiceController(IInvoiceQrCodeService invoiceQrCodeService) : ControllerBase
{
    [HttpPost("generate-qr")]
    public IActionResult GenerateQrCode([FromBody] InvoiceRequest request)
    {
        var result = invoiceQrCodeService.Generate(request);
        var base64Image = Convert.ToBase64String(result.Image);

        return Ok(new
        {
            success = true,
            qrCodeBase64 = base64Image,
            qrCodeDataUrl = $"data:image/png;base64,{base64Image}",
            rawData = result.RawData
        });
    }

    [HttpPost("generate-qr-image")]
    public IActionResult GenerateQrCodeImage([FromBody] InvoiceRequest request)
    {
        var result = invoiceQrCodeService.Generate(request);
        return File(result.Image, "image/png", "invoice-qr.png");
    }
}
