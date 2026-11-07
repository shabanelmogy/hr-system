using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AllowSystemErrorLogGlobalReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_GlobalCrystalReports_Entity",
                schema: "rpt",
                table: "GlobalCrystalReports");

            migrationBuilder.AddCheckConstraint(
                name: "CK_GlobalCrystalReports_Entity",
                schema: "rpt",
                table: "GlobalCrystalReports",
                sql: "[EntityKey] IN ('countries','states','districts','system-error-logs')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_GlobalCrystalReports_Entity",
                schema: "rpt",
                table: "GlobalCrystalReports");

            migrationBuilder.AddCheckConstraint(
                name: "CK_GlobalCrystalReports_Entity",
                schema: "rpt",
                table: "GlobalCrystalReports",
                sql: "[EntityKey] IN ('countries','states','districts')");
        }
    }
}
