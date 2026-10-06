using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Accounting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFiscalYearWorkingContext : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsCurrent",
                schema: "acc",
                table: "FiscalYears",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "FiscalYearUserSelections",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SelectedFiscalYearId = table.Column<int>(type: "int", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FiscalYearUserSelections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FiscalYearUserSelections_FiscalYears_TenantId_CompanyId_SelectedFiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.SelectedFiscalYearId },
                        principalSchema: "acc",
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_IsCurrent",
                schema: "acc",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "IsCurrent" },
                unique: true,
                filter: "[IsCurrent] = CAST(1 AS bit) AND [IsDeleted] = CAST(0 AS bit)");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYearUserSelections_TenantId",
                schema: "acc",
                table: "FiscalYearUserSelections",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYearUserSelections_TenantId_CompanyId",
                schema: "acc",
                table: "FiscalYearUserSelections",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYearUserSelections_TenantId_CompanyId_SelectedFiscalYearId",
                schema: "acc",
                table: "FiscalYearUserSelections",
                columns: new[] { "TenantId", "CompanyId", "SelectedFiscalYearId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYearUserSelections_TenantId_CompanyId_UserId",
                schema: "acc",
                table: "FiscalYearUserSelections",
                columns: new[] { "TenantId", "CompanyId", "UserId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FiscalYearUserSelections",
                schema: "acc");

            migrationBuilder.DropIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_IsCurrent",
                schema: "acc",
                table: "FiscalYears");

            migrationBuilder.DropColumn(
                name: "IsCurrent",
                schema: "acc",
                table: "FiscalYears");
        }
    }
}
