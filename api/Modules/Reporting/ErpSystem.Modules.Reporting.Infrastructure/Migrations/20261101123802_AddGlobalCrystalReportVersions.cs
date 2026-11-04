using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobalCrystalReportVersions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "GlobalCrystalReports",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ReportKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CurrentPublishedVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalCrystalReports", x => x.Id);
                    table.CheckConstraint("CK_GlobalCrystalReports_Entity", "[EntityKey] IN ('countries','states','districts')");
                });

            migrationBuilder.CreateTable(
                name: "GlobalCrystalReportVersions",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GlobalCrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    StorageKey = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Sha256 = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    SummaryTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SummarySubject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidationStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ValidationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidationContractSchemaVersion = table.Column<int>(type: "int", nullable: true),
                    ValidationContractFingerprint = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: true),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GlobalCrystalReportVersions", x => x.Id);
                    table.UniqueConstraint("AK_GlobalCrystalReportVersions_GlobalCrystalReportId_Id", x => new { x.GlobalCrystalReportId, x.Id });
                    table.CheckConstraint("CK_GlobalCrystalReportVersions_Number", "[VersionNumber] > 0 AND [Size] > 0");
                    table.CheckConstraint("CK_GlobalCrystalReportVersions_Validation", "([ValidationStatus] = 'Valid' AND [ValidationContractSchemaVersion] > 0 AND LEN([ValidationContractFingerprint]) = 64) OR ([ValidationStatus] = 'Invalid' AND [ValidationContractSchemaVersion] IS NULL AND [ValidationContractFingerprint] IS NULL)");
                    table.ForeignKey(
                        name: "FK_GlobalCrystalReportVersions_GlobalCrystalReports_GlobalCrystalReportId",
                        column: x => x.GlobalCrystalReportId,
                        principalSchema: "rpt",
                        principalTable: "GlobalCrystalReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalCrystalReports_EntityKey_ReportKey",
                schema: "rpt",
                table: "GlobalCrystalReports",
                columns: new[] { "EntityKey", "ReportKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GlobalCrystalReports_Id_CurrentPublishedVersionId",
                schema: "rpt",
                table: "GlobalCrystalReports",
                columns: new[] { "Id", "CurrentPublishedVersionId" });

            migrationBuilder.CreateIndex(
                name: "IX_GlobalCrystalReportVersions_GlobalCrystalReportId_VersionNumber",
                schema: "rpt",
                table: "GlobalCrystalReportVersions",
                columns: new[] { "GlobalCrystalReportId", "VersionNumber" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_GlobalCrystalReports_GlobalCrystalReportVersions_Id_CurrentPublishedVersionId",
                schema: "rpt",
                table: "GlobalCrystalReports",
                columns: new[] { "Id", "CurrentPublishedVersionId" },
                principalSchema: "rpt",
                principalTable: "GlobalCrystalReportVersions",
                principalColumns: new[] { "GlobalCrystalReportId", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_GlobalCrystalReports_GlobalCrystalReportVersions_Id_CurrentPublishedVersionId",
                schema: "rpt",
                table: "GlobalCrystalReports");

            migrationBuilder.DropTable(
                name: "GlobalCrystalReportVersions",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "GlobalCrystalReports",
                schema: "rpt");
        }
    }
}
