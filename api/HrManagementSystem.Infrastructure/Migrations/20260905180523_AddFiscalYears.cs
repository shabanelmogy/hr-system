using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFiscalYears : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FiscalYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodFrequency = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalYears", x => x.Id);
                    table.UniqueConstraint("AK_FiscalYears_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalYears_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalYears_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FiscalPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalPeriods", x => x.Id);
                    table.UniqueConstraint("AK_FiscalPeriods_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_CreatedById",
                table: "FiscalPeriods",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_DeletedById",
                table: "FiscalPeriods",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId",
                table: "FiscalPeriods",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_Code",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_FiscalYearId_Sequence",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "Sequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_UpdatedById",
                table: "FiscalPeriods",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_CreatedById",
                table: "FiscalYears",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_DeletedById",
                table: "FiscalYears",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId",
                table: "FiscalYears",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_Code",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_StartDate_EndDate_IsDeleted",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "StartDate", "EndDate", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_UpdatedById",
                table: "FiscalYears",
                column: "UpdatedById");

            migrationBuilder.Sql(
                """
                INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
                SELECT [role].[Id], N'Permissions', [permission].[Value]
                FROM [AspNetRoles] AS [role]
                CROSS JOIN (VALUES
                    (N'FiscalYears:View'),
                    (N'FiscalYears:Create'),
                    (N'FiscalYears:Edit'),
                    (N'FiscalYears:Delete'),
                    (N'FiscalYears:ManageLifecycle')
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
                      N'FiscalYears:View',
                      N'FiscalYears:Create',
                      N'FiscalYears:Edit',
                      N'FiscalYears:Delete',
                      N'FiscalYears:ManageLifecycle'
                  );
                """);

            migrationBuilder.DropTable(
                name: "FiscalPeriods");

            migrationBuilder.DropTable(
                name: "FiscalYears");
        }
    }
}
