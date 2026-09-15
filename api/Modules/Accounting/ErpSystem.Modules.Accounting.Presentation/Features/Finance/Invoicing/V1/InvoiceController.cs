using ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Contracts;
using ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Queries;
using ErpSystem.Modules.Accounting.Contracts.Authorization;

namespace ErpSystem.Modules.Accounting.Presentation.Features.Finance.Invoicing.V1;

[ApiVersion("1.0")]
[ApiController]
[Route("api/[controller]")]
[Route("api/v{version:apiVersion}/[controller]")]
[TenantMember]
[AllowTenantReadOnly]
public sealed class InvoiceController(ISender sender) : ControllerBase
{
    [HttpPost("generate-qr")]
    [HasPermission(AccountingPermissions.GenerateInvoiceQrCode)]
    public async Task<IActionResult> GenerateQrCode(
        [FromBody] InvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GenerateInvoiceQrCodeQuery(request), cancellationToken);
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
    [HasPermission(AccountingPermissions.GenerateInvoiceQrCode)]
    public async Task<IActionResult> GenerateQrCodeImage(
        [FromBody] InvoiceRequest request,
        CancellationToken cancellationToken)
    {
        var result = await sender.Send(new GenerateInvoiceQrCodeQuery(request), cancellationToken);
        return File(result.Image, "image/png", "invoice-qr.png");
    }
}
