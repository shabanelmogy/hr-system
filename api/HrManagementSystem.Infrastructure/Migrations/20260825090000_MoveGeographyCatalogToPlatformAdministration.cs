using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260825090000_MoveGeographyCatalogToPlatformAdministration")]
public partial class MoveGeographyCatalogToPlatformAdministration : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            DECLARE @GeographyPermissions TABLE ([ClaimValue] nvarchar(256) NOT NULL PRIMARY KEY);

            INSERT INTO @GeographyPermissions ([ClaimValue])
            VALUES
                (N'Countries:View'),
                (N'Countries:Create'),
                (N'Countries:Edit'),
                (N'Countries:Delete'),
                (N'States:View'),
                (N'States:Create'),
                (N'States:Edit'),
                (N'States:Delete'),
                (N'Districts:View'),
                (N'Districts:Create'),
                (N'Districts:Edit'),
                (N'Districts:Delete');

            INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
            SELECT
                [role].[Id],
                N'Permissions',
                [permission].[ClaimValue]
            FROM [AspNetRoles] AS [role]
            CROSS JOIN @GeographyPermissions AS [permission]
            WHERE [role].[IsSystem] = 1
              AND [role].[NormalizedName] = N'SUPER_ADMIN'
              AND NOT EXISTS (
                  SELECT 1
                  FROM [AspNetRoleClaims] AS [existing]
                  WHERE [existing].[RoleId] = [role].[Id]
                    AND [existing].[ClaimType] = N'Permissions'
                    AND [existing].[ClaimValue] = [permission].[ClaimValue]
              );

            DELETE [claim]
            FROM [AspNetRoleClaims] AS [claim]
            INNER JOIN @GeographyPermissions AS [permission]
                ON [permission].[ClaimValue] = [claim].[ClaimValue]
            INNER JOIN [AspNetRoles] AS [role]
                ON [role].[Id] = [claim].[RoleId]
            WHERE [claim].[ClaimType] = N'Permissions'
              AND NOT (
                  [role].[IsSystem] = 1
                  AND [role].[NormalizedName] = N'SUPER_ADMIN'
              );

            UPDATE [Notifications]
            SET [ActionUrl] = N'/super-admin/geography/countries'
            WHERE [ActionUrl] IN (
                N'/basic-data/countries',
                N'/basic-data/geographical-information/countries'
            );

            UPDATE [Notifications]
            SET [ActionUrl] = N'/super-admin/geography/states'
            WHERE [ActionUrl] IN (
                N'/basic-data/states',
                N'/basic-data/geographical-information/states'
            );

            UPDATE [Notifications]
            SET [ActionUrl] = N'/super-admin/geography/districts'
            WHERE [ActionUrl] IN (
                N'/basic-data/districts',
                N'/basic-data/geographical-information/districts'
            );
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Permission claims do not retain assignment provenance, so ownership cannot
        // be safely restored to tenant roles. The platform-only authorization boundary
        // remains fail-closed if this data migration is rolled back.
    }
}
