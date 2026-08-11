namespace HrManagementSystem.Application.Features.Finance.Invoicing.Contracts;

public sealed record InvoiceRequest(
    string SellerName,
    string VatRegistrationNumber,
    string InvoiceTimestamp,
    decimal InvoiceTotal,
    decimal VatTotal);
