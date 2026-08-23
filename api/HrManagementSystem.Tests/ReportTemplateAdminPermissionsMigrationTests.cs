using System.Reflection;
using HrManagementSystem.Application.Common.Consts;
using HrManagementSystem.Infrastructure.Migrations;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;

namespace HrManagementSystem.Tests;

public sealed class ReportTemplateAdminPermissionsMigrationTests
{
    [Fact]
    public void Up_AddsEveryReportTemplatePermissionIdempotentlyToSystemAdmin()
    {
        var migrationAttribute = typeof(AddReportTemplateAdminPermissions)
            .GetCustomAttribute<MigrationAttribute>();
        var builder = InvokeMigrationMethod("Up");
        var sql = Assert.Single(builder.Operations.OfType<SqlOperation>()).Sql;

        Assert.Equal(
            "20260823112901_AddReportTemplateAdminPermissions",
            migrationAttribute?.Id);
        Assert.Contains("[role].[IsSystem] = 1", sql, StringComparison.Ordinal);
        Assert.Contains("[role].[NormalizedName] = N'ADMIN'", sql, StringComparison.Ordinal);
        Assert.Contains("NOT EXISTS", sql, StringComparison.Ordinal);
        Assert.Contains("[existing].[RoleId] = [role].[Id]", sql, StringComparison.Ordinal);
        Assert.Contains("[existing].[ClaimType] = N'Permissions'", sql, StringComparison.Ordinal);

        foreach (var permission in ReportTemplatePermissions)
            Assert.Contains($"N'{permission}'", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void Down_DoesNotDeleteClaimsWithoutProvenance()
    {
        var builder = InvokeMigrationMethod("Down");

        Assert.Empty(builder.Operations);
    }

    private static readonly string[] ReportTemplatePermissions =
    [
        Permissions.ViewReportTemplates,
        Permissions.CreateReportTemplates,
        Permissions.EditReportTemplates,
        Permissions.PublishReportTemplates,
        Permissions.DeleteReportTemplates
    ];

    private static MigrationBuilder InvokeMigrationMethod(string methodName)
    {
        var migration = new AddReportTemplateAdminPermissions();
        var builder = new MigrationBuilder("Microsoft.EntityFrameworkCore.SqlServer");
        typeof(AddReportTemplateAdminPermissions)
            .GetMethod(methodName, BindingFlags.Instance | BindingFlags.NonPublic)!
            .Invoke(migration, [builder]);
        return builder;
    }
}
