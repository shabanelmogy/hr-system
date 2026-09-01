using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GrantOrganizationalStructurePermissionsToAdmin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
                SELECT [role].[Id], N'Permissions', [permission].[Value]
                FROM [AspNetRoles] AS [role]
                CROSS JOIN (VALUES
                    (N'OrganizationalStructure:View'),
                    (N'OrganizationalStructure:Create'),
                    (N'OrganizationalStructure:Edit'),
                    (N'OrganizationalStructure:Delete'),
                    (N'OrganizationalStructure:ApproveJobDescriptions')
                ) AS [permission]([Value])
                WHERE [role].[IsSystem] = CAST(1 AS bit)
                  AND [role].[NormalizedName] = N'ADMIN'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM [AspNetRoleClaims] AS [existing]
                      WHERE [existing].[RoleId] = [role].[Id]
                        AND [existing].[ClaimType] = N'Permissions'
                        AND [existing].[ClaimValue] = [permission].[Value]
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE [claim]
                FROM [AspNetRoleClaims] AS [claim]
                INNER JOIN [AspNetRoles] AS [role] ON [role].[Id] = [claim].[RoleId]
                WHERE [role].[IsSystem] = CAST(1 AS bit)
                  AND [role].[NormalizedName] = N'ADMIN'
                  AND [claim].[ClaimType] = N'Permissions'
                  AND [claim].[ClaimValue] IN (
                      N'OrganizationalStructure:View',
                      N'OrganizationalStructure:Create',
                      N'OrganizationalStructure:Edit',
                      N'OrganizationalStructure:Delete',
                      N'OrganizationalStructure:ApproveJobDescriptions'
                  );
                """);
        }
    }
}
