using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class TenantScopedRoleIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles");

            migrationBuilder.AddColumn<bool>(
                name: "IsSystem",
                table: "AspNetRoles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "AspNetRoles",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.Sql(
                """
                SET XACT_ABORT ON;

                UPDATE [AspNetRoles]
                SET [IsSystem] = 1,
                    [TenantId] = NULL
                WHERE [NormalizedName] IN ('SUPER_ADMIN', 'ADMIN', 'USER');

                IF EXISTS
                (
                    SELECT 1
                    FROM [AspNetRoles] AS [role]
                    WHERE [role].[IsSystem] = 0
                      AND NOT EXISTS
                      (
                          SELECT 1
                          FROM [AspNetUserRoles] AS [userRole]
                          WHERE [userRole].[RoleId] = [role].[Id]
                      )
                )
                BEGIN
                    THROW 51000, 'Tenant role isolation cannot infer ownership for an unassigned legacy custom role.', 1;
                END;

                IF EXISTS
                (
                    SELECT 1
                    FROM [AspNetUserRoles] AS [userRole]
                    INNER JOIN [AspNetRoles] AS [role] ON [role].[Id] = [userRole].[RoleId]
                    WHERE [role].[IsSystem] = 0
                      AND NOT EXISTS
                      (
                          SELECT 1
                          FROM [UserTenantAccesses] AS [tenantAccess]
                          WHERE [tenantAccess].[UserId] = [userRole].[UserId]
                      )
                )
                BEGIN
                    THROW 51000, 'Tenant role isolation cannot infer ownership for a legacy custom-role assignment without tenant access.', 1;
                END;

                CREATE TABLE [#RoleTenantMap]
                (
                    [OldRoleId] nvarchar(450) NOT NULL,
                    [TenantId] nvarchar(32) NOT NULL,
                    [NewRoleId] nvarchar(450) NOT NULL,
                    CONSTRAINT [PK_RoleTenantMap] PRIMARY KEY ([OldRoleId], [TenantId])
                );

                ;WITH [DistinctRoleTenants] AS
                (
                    SELECT DISTINCT
                        [role].[Id] AS [OldRoleId],
                        [tenantAccess].[TenantId]
                    FROM [AspNetRoles] AS [role]
                    INNER JOIN [AspNetUserRoles] AS [userRole] ON [userRole].[RoleId] = [role].[Id]
                    INNER JOIN [UserTenantAccesses] AS [tenantAccess] ON [tenantAccess].[UserId] = [userRole].[UserId]
                    WHERE [role].[IsSystem] = 0
                ),
                [RoleTenants] AS
                (
                    SELECT
                        [OldRoleId],
                        [TenantId],
                        ROW_NUMBER() OVER
                        (
                            PARTITION BY [OldRoleId]
                            ORDER BY [TenantId]
                        ) AS [TenantOrdinal]
                    FROM [DistinctRoleTenants]
                )
                INSERT INTO [#RoleTenantMap] ([OldRoleId], [TenantId], [NewRoleId])
                SELECT
                    [OldRoleId],
                    [TenantId],
                    CASE
                        WHEN [TenantOrdinal] = 1 THEN [OldRoleId]
                        ELSE CONVERT(nvarchar(450), NEWID())
                    END
                FROM [RoleTenants];

                SELECT DISTINCT
                    [userRole].[UserId],
                    [roleMap].[NewRoleId] AS [RoleId]
                INTO [#DesiredCustomRoleAssignments]
                FROM [AspNetUserRoles] AS [userRole]
                INNER JOIN [#RoleTenantMap] AS [roleMap] ON [roleMap].[OldRoleId] = [userRole].[RoleId]
                INNER JOIN [UserTenantAccesses] AS [tenantAccess]
                    ON [tenantAccess].[UserId] = [userRole].[UserId]
                   AND [tenantAccess].[TenantId] = [roleMap].[TenantId];

                UPDATE [role]
                SET [role].[TenantId] = [roleMap].[TenantId]
                FROM [AspNetRoles] AS [role]
                INNER JOIN [#RoleTenantMap] AS [roleMap]
                    ON [roleMap].[OldRoleId] = [role].[Id]
                   AND [roleMap].[NewRoleId] = [role].[Id];

                INSERT INTO [AspNetRoles]
                    ([Id], [Name], [NormalizedName], [ConcurrencyStamp], [IsDefault], [IsDeleted], [TenantId], [IsSystem])
                SELECT
                    [roleMap].[NewRoleId],
                    [role].[Name],
                    [role].[NormalizedName],
                    CONVERT(nvarchar(450), NEWID()),
                    [role].[IsDefault],
                    [role].[IsDeleted],
                    [roleMap].[TenantId],
                    0
                FROM [#RoleTenantMap] AS [roleMap]
                INNER JOIN [AspNetRoles] AS [role] ON [role].[Id] = [roleMap].[OldRoleId]
                WHERE [roleMap].[NewRoleId] <> [roleMap].[OldRoleId];

                INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
                SELECT
                    [roleMap].[NewRoleId],
                    [roleClaim].[ClaimType],
                    [roleClaim].[ClaimValue]
                FROM [#RoleTenantMap] AS [roleMap]
                INNER JOIN [AspNetRoleClaims] AS [roleClaim] ON [roleClaim].[RoleId] = [roleMap].[OldRoleId]
                WHERE [roleMap].[NewRoleId] <> [roleMap].[OldRoleId];

                DELETE [userRole]
                FROM [AspNetUserRoles] AS [userRole]
                INNER JOIN [#RoleTenantMap] AS [roleMap] ON [roleMap].[OldRoleId] = [userRole].[RoleId];

                INSERT INTO [AspNetUserRoles] ([UserId], [RoleId])
                SELECT [UserId], [RoleId]
                FROM [#DesiredCustomRoleAssignments];

                DROP TABLE [#DesiredCustomRoleAssignments];
                DROP TABLE [#RoleTenantMap];
                """);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoles_System_NormalizedName",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[IsSystem] = 1 AND [NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoles_Tenant_NormalizedName",
                table: "AspNetRoles",
                columns: new[] { "TenantId", "NormalizedName" },
                unique: true,
                filter: "[IsSystem] = 0 AND [TenantId] IS NOT NULL AND [NormalizedName] IS NOT NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_AspNetRoles_SystemTenantConsistency",
                table: "AspNetRoles",
                sql: "([IsSystem] = 1 AND [TenantId] IS NULL AND [NormalizedName] IN ('SUPER_ADMIN', 'ADMIN', 'USER')) OR ([IsSystem] = 0 AND [TenantId] IS NOT NULL AND ([NormalizedName] IS NULL OR [NormalizedName] NOT IN ('SUPER_ADMIN', 'ADMIN', 'USER')))");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoles_Tenants_TenantId",
                table: "AspNetRoles",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                THROW 51000, 'TenantScopedRoleIsolation is intentionally irreversible because custom roles and assignments may have been split across tenants.', 1;
                """);
        }
    }
}
