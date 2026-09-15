using ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Contracts;

namespace ErpSystem.Modules.Accounting.Application.Features.Finance.Invoicing.Queries;

public sealed record InvoiceQrCodeResult(string RawData, byte[] Image);

public interface IInvoiceQrCodeGenerator
{
    InvoiceQrCodeResult Generate(InvoiceRequest request);
}

public sealed record GenerateInvoiceQrCodeQuery(InvoiceRequest Request)
    : IQuery<InvoiceQrCodeResult>;

public sealed class GenerateInvoiceQrCodeQueryHandler(IInvoiceQrCodeGenerator generator)
    : IQueryHandler<GenerateInvoiceQrCodeQuery, InvoiceQrCodeResult>
{
    public Task<InvoiceQrCodeResult> Handle(
        GenerateInvoiceQrCodeQuery request,
        CancellationToken cancellationToken) =>
        Task.FromResult(generator.Generate(request.Request));
}
