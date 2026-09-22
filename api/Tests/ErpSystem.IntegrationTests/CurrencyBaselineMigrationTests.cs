using ErpSystem.Modules.Accounting.Infrastructure.Migrations;
using ErpSystem.Modules.HR.Infrastructure.Migrations;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace ErpSystem.IntegrationTests;

public sealed class CurrencyBaselineMigrationTests
{
    [Fact]
    public void InitialBaselines_AssignCurrencyPersistenceOnlyToAccounting()
    {
        var accountingOperations = new ExposedInitialAccounting().BuildUpOperations();
        var hrOperations = new ExposedInitialHr().BuildUpOperations();

        var currencyTable = Assert.Single(
            accountingOperations.OfType<CreateTableOperation>(),
            operation =>
                operation.Name == "Currencies" &&
                operation.Schema == "acc");

        Assert.Contains(currencyTable.Columns, column => column.Name == "CurrencyCode");
        Assert.Contains(currencyTable.Columns, column => column.Name == "NameEn");
        Assert.Contains(currencyTable.Columns, column => column.Name == "NameAr");
        Assert.Contains(currencyTable.Columns, column => column.Name == "Symbol");
        Assert.Contains(currencyTable.Columns, column => column.Name == "TenantId");
        Assert.Contains(currencyTable.Columns, column => column.Name == "CompanyId");
        Assert.DoesNotContain(currencyTable.Columns, column => column.Name == "ExchangeRateToDefault");
        Assert.DoesNotContain(currencyTable.Columns, column => column.Name == "IsDefault");

        Assert.DoesNotContain(
            hrOperations.OfType<CreateTableOperation>(),
            operation => operation.Name == "Currencies");

        var accountingIndexes = accountingOperations
            .OfType<CreateIndexOperation>()
            .Where(operation => operation.Table == "Currencies" && operation.Schema == "acc")
            .ToArray();
        Assert.Contains(accountingIndexes, index =>
            index.Name == "IX_Currencies_TenantId_CompanyId_CurrencyCode" &&
            index.IsUnique);
    }

    private sealed class ExposedInitialAccounting : InitialAccounting
    {
        public List<MigrationOperation> BuildUpOperations()
        {
            var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
            base.Up(builder);
            return builder.Operations;
        }
    }

    private sealed class ExposedInitialHr : InitialHr
    {
        public List<MigrationOperation> BuildUpOperations()
        {
            var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
            base.Up(builder);
            return builder.Operations;
        }
    }
}
