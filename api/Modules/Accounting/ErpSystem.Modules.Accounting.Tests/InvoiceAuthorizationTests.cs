using System.Reflection;
using ErpSystem.BuildingBlocks.Authorization;
using ErpSystem.Modules.Accounting.Contracts.Authorization;
using ErpSystem.Modules.Accounting.Presentation.Features.Finance.Invoicing.V1;

namespace ErpSystem.Modules.Accounting.Tests;

public sealed class InvoiceAuthorizationTests
{
    [Fact]
    public void InvoiceQrActions_RequireDedicatedAccountingPermission()
    {
        foreach (var actionName in new[]
                 {
                     nameof(InvoiceController.GenerateQrCode),
                     nameof(InvoiceController.GenerateQrCodeImage)
                 })
        {
            var method = typeof(InvoiceController).GetMethod(actionName, BindingFlags.Instance | BindingFlags.Public);
            Assert.NotNull(method);
            var permission = method!.GetCustomAttribute<HasPermissionAttribute>(inherit: true);
            Assert.NotNull(permission);
            Assert.Equal(AccountingPermissions.GenerateInvoiceQrCode, permission!.Policy);
        }
    }

    [Fact]
    public void AccountingCatalog_DeclaresInvoicingPermission()
    {
        var definition = new AccountingModule().Definition;
        var invoicing = Assert.Single(definition.Submodules, item => item.Code == "invoicing");

        Assert.Contains(AccountingPermissions.GenerateInvoiceQrCode, invoicing.RequiredPermissions);
        Assert.Contains(AccountingPermissions.GenerateInvoiceQrCode, AccountingPermissions.All);
    }
}
