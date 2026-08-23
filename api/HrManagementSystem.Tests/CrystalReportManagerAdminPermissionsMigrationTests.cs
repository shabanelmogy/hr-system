using System.Reflection;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Infrastructure.Migrations;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace HrManagementSystem.Tests;

public sealed class CrystalReportManagerAdminPermissionsMigrationTests
{
    [Fact]
    public void Up_AddsEveryCrystalReportPermissionIdempotentlyToSystemAdmin()
    {
        var builder = InvokeMigrationMethod("Up");
        var sql = Assert.Single(builder.Operations.OfType<SqlOperation>()).Sql;

        Assert.Contains("[role].[IsSystem] = 1", sql, StringComparison.Ordinal);
        Assert.Contains("[role].[NormalizedName] = N'ADMIN'", sql, StringComparison.Ordinal);
        Assert.Contains("NOT EXISTS", sql, StringComparison.Ordinal);

        foreach (var permission in CrystalReportPermissions)
            Assert.Contains($"N'{permission}'", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void Down_DoesNotDeleteClaimsWithoutProvenance()
    {
        var builder = InvokeMigrationMethod("Down");

        Assert.Empty(builder.Operations);
    }

    private static readonly string[] CrystalReportPermissions =
    [
        Permissions.ViewCrystalReports,
        Permissions.CreateCrystalReports,
        Permissions.DownloadCrystalReports,
        Permissions.UploadCrystalReports,
        Permissions.PublishCrystalReports,
        Permissions.ManageCrystalReportAccess,
        Permissions.DeleteCrystalReports
    ];

    private static MigrationBuilder InvokeMigrationMethod(string methodName)
    {
        var migration = new AddCrystalReportManagerAdminPermissions();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(AddCrystalReportManagerAdminPermissions)
            .GetMethod(methodName, BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);
        return builder;
    }
}
