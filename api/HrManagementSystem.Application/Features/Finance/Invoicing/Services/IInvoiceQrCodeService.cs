using HrManagementSystem.Application.Features.Finance.Invoicing.Contracts;

namespace HrManagementSystem.Application.Features.Finance.Invoicing.Services;

public interface IInvoiceQrCodeService
{
    InvoiceQrCodeResult Generate(InvoiceRequest request);
}

public sealed record InvoiceQrCodeResult(string RawData, byte[] Image);
