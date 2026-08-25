using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyGeographicScope : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyCountries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyCountries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_CountryId",
                table: "CompanyCountries",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_CreatedById",
                table: "CompanyCountries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_DeletedById",
                table: "CompanyCountries",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId",
                table: "CompanyCountries",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId_CompanyId",
                table: "CompanyCountries",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true,
                filter: "[IsDefault] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId_CompanyId_CountryId",
                table: "CompanyCountries",
                columns: new[] { "TenantId", "CompanyId", "CountryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_UpdatedById",
                table: "CompanyCountries",
                column: "UpdatedById");

            migrationBuilder.Sql(
                """
                INSERT INTO [CompanyCountries]
                    ([CountryId], [IsDefault], [CreatedById], [CreatedOn], [CreatedByPc],
                     [IsDeleted], [TenantId], [CompanyId])
                SELECT
                    [country].[Id], 0, [company].[CreatedById], SYSUTCDATETIME(),
                    N'AddCompanyGeographicScope', 0, [company].[TenantId], [company].[Id]
                FROM [Companies] AS [company]
                CROSS JOIN [Countries] AS [country]
                WHERE [company].[IsDeleted] = 0
                  AND [country].[IsDeleted] = 0
                  AND NOT EXISTS (
                      SELECT 1
                      FROM [CompanyCountries] AS [existing]
                      WHERE [existing].[TenantId] = [company].[TenantId]
                        AND [existing].[CompanyId] = [company].[Id]
                        AND [existing].[CountryId] = [country].[Id]
                  );

                INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
                SELECT
                    [role].[Id],
                    N'Permissions',
                    [permission].[ClaimValue]
                FROM [AspNetRoles] AS [role]
                CROSS JOIN (VALUES
                    (N'CompanyGeographicScope:View'),
                    (N'CompanyGeographicScope:Manage')
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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyCountries");

            // Role claims do not record their source. Removing these values could
            // delete permissions assigned manually before or after this migration.
        }
    }
}
