using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class BindGlobalCrystalReportViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ViewFingerprint",
                schema: "rpt",
                table: "GlobalCrystalReports",
                type: "nchar(64)",
                fixedLength: true,
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ViewName",
                schema: "rpt",
                table: "GlobalCrystalReports",
                type: "nvarchar(257)",
                maxLength: 257,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_GlobalCrystalReports_ViewBinding",
                schema: "rpt",
                table: "GlobalCrystalReports",
                sql: "([ViewName] IS NULL AND [ViewFingerprint] IS NULL) OR ([ViewName] IS NOT NULL AND [ViewFingerprint] IS NOT NULL AND LEN([ViewFingerprint]) = 64)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_GlobalCrystalReports_ViewBinding",
                schema: "rpt",
                table: "GlobalCrystalReports");

            migrationBuilder.DropColumn(
                name: "ViewFingerprint",
                schema: "rpt",
                table: "GlobalCrystalReports");

            migrationBuilder.DropColumn(
                name: "ViewName",
                schema: "rpt",
                table: "GlobalCrystalReports");
        }
    }
}
