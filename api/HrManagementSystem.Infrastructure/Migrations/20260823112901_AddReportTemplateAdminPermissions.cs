using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260823112901_AddReportTemplateAdminPermissions")]
public partial class AddReportTemplateAdminPermissions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
            SELECT
                [role].[Id],
                N'Permissions',
                [permission].[ClaimValue]
            FROM [AspNetRoles] AS [role]
            CROSS JOIN (VALUES
                (N'ReportTemplates:View'),
                (N'ReportTemplates:Create'),
                (N'ReportTemplates:Edit'),
                (N'ReportTemplates:Publish'),
                (N'ReportTemplates:Delete')
            ) AS [permission] ([ClaimValue])
            WHERE [role].[IsSystem] = 1
              AND [role].[NormalizedName] = N'ADMIN'
              AND NOT EXISTS (
                  SELECT 1
                  FROM [AspNetRoleClaims] AS [existing]
                  WHERE [existing].[RoleId] = [role].[Id]
                    AND [existing].[ClaimType] = N'Permissions'
                    AND [existing].[ClaimValue] = [permission].[ClaimValue]
              );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Role claims do not record who created them. Removing these values could
        // delete permissions assigned manually before or after this migration.
    }
}
