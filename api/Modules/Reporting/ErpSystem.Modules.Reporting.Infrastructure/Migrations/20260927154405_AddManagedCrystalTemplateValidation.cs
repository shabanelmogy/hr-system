using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddManagedCrystalTemplateValidation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ValidationContractFingerprint",
                schema: "rpt",
                table: "CrystalReportVersions",
                type: "nchar(64)",
                fixedLength: true,
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ValidationContractSchemaVersion",
                schema: "rpt",
                table: "CrystalReportVersions",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                "UPDATE [rpt].[CrystalReportVersions] " +
                "SET [ValidationStatus] = 'NeedsRevalidation', [ValidationReason] = NULL;");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CrystalReportVersions_ValidationEvidence",
                schema: "rpt",
                table: "CrystalReportVersions",
                sql: "([ValidationStatus] = 'Valid' AND [ValidationContractSchemaVersion] > 0 AND LEN([ValidationContractFingerprint]) = 64) OR ([ValidationStatus] <> 'Valid' AND [ValidationContractSchemaVersion] IS NULL AND [ValidationContractFingerprint] IS NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_CrystalReportVersions_ValidationStatus",
                schema: "rpt",
                table: "CrystalReportVersions",
                sql: "[ValidationStatus] IN ('Pending', 'Valid', 'Invalid', 'NeedsRevalidation')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_CrystalReportVersions_ValidationEvidence",
                schema: "rpt",
                table: "CrystalReportVersions");

            migrationBuilder.DropCheckConstraint(
                name: "CK_CrystalReportVersions_ValidationStatus",
                schema: "rpt",
                table: "CrystalReportVersions");

            migrationBuilder.Sql(
                "UPDATE [rpt].[CrystalReportVersions] " +
                "SET [ValidationStatus] = 'Invalid', " +
                "[ValidationReason] = 'Revalidation is required after a managed Crystal contract change.' " +
                "WHERE [ValidationStatus] = 'NeedsRevalidation';");

            migrationBuilder.DropColumn(
                name: "ValidationContractFingerprint",
                schema: "rpt",
                table: "CrystalReportVersions");

            migrationBuilder.DropColumn(
                name: "ValidationContractSchemaVersion",
                schema: "rpt",
                table: "CrystalReportVersions");
        }
    }
}
