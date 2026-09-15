using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialReporting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "rpt");

            migrationBuilder.CreateTable(
                name: "ReportsCategories",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_ReportsCategories", x => x.Id);
                    table.CheckConstraint("CHK_ReportCategory_Name_EnglishWithSpaces", "[Name] NOT LIKE '%[^A-Za-z ]%'");
                });

            migrationBuilder.CreateTable(
                name: "ReportTemplates",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeatureKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataSourceKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DefinitionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentHash = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplates", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReportMasters",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReportName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExportedName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReportPath = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ViewName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReportCategoryId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_ReportMasters", x => x.Id);
                    table.CheckConstraint("CHK_ReportMaster_ExportedName_EnglishOnly", "[ExportedName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_Logo_EnglishOnly", "[Logo] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ReportName_EnglishOnly", "[ReportName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ReportPath_EnglishOnly", "[ReportPath] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ViewName_EnglishOnly", "[ViewName] NOT LIKE '%[^A-Za-z ]%'");
                    table.ForeignKey(
                        name: "FK_ReportMasters_ReportsCategories_ReportCategoryId",
                        column: x => x.ReportCategoryId,
                        principalSchema: "rpt",
                        principalTable: "ReportsCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportTemplateRevisions",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    Operation = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataSourceKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DefinitionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentHash = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportTemplateRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalSchema: "rpt",
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportsDetails",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ColumnName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReportMasterId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_ReportsDetails", x => x.Id);
                    table.CheckConstraint("CHK_ReportDetail_ColumnName_EnglishOnly", "[ColumnName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportDetail_PropertyName_EnglishOnly", "[PropertyName] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");
                    table.ForeignKey(
                        name: "FK_ReportsDetails_ReportMasters_ReportMasterId",
                        column: x => x.ReportMasterId,
                        principalSchema: "rpt",
                        principalTable: "ReportMasters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReportRoleGrants",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Rights = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_CrystalReportRoleGrants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReports",
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrystalReports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReportVersions",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    StorageKey = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Sha256 = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    SummaryTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SummarySubject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidationStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ValidationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrystalReportVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                        column: x => x.CrystalReportId,
                        principalSchema: "rpt",
                        principalTable: "CrystalReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_CrystalReportId",
                schema: "rpt",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId",
                schema: "rpt",
                table: "CrystalReportRoleGrants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId",
                schema: "rpt",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId_CrystalReportId_RoleId",
                schema: "rpt",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId", "CrystalReportId", "RoleId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_CurrentPublishedVersionId",
                schema: "rpt",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId",
                schema: "rpt",
                table: "CrystalReports",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_IsDeleted_DisplayName",
                schema: "rpt",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "IsDeleted", "DisplayName" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_ReportKey",
                schema: "rpt",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "ReportKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_CrystalReportId",
                schema: "rpt",
                table: "CrystalReportVersions",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId",
                schema: "rpt",
                table: "CrystalReportVersions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_CrystalReportId_VersionNumber",
                schema: "rpt",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "CrystalReportId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_StorageKey",
                schema: "rpt",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "StorageKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportMasters_ExportedName",
                schema: "rpt",
                table: "ReportMasters",
                column: "ExportedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportMasters_ReportCategoryId",
                schema: "rpt",
                table: "ReportMasters",
                column: "ReportCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportMasters_ReportName",
                schema: "rpt",
                table: "ReportMasters",
                column: "ReportName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsCategories_Name",
                schema: "rpt",
                table: "ReportsCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsDetails_ReportMasterId",
                schema: "rpt",
                table: "ReportsDetails",
                column: "ReportMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_ReportTemplateId",
                schema: "rpt",
                table: "ReportTemplateRevisions",
                column: "ReportTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_TenantId",
                schema: "rpt",
                table: "ReportTemplateRevisions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_TenantId_ReportTemplateId_RevisionNumber",
                schema: "rpt",
                table: "ReportTemplateRevisions",
                columns: new[] { "TenantId", "ReportTemplateId", "RevisionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId",
                schema: "rpt",
                table: "ReportTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId_FeatureKey_IsDeleted_IsPublished_Name",
                schema: "rpt",
                table: "ReportTemplates",
                columns: new[] { "TenantId", "FeatureKey", "IsDeleted", "IsPublished", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId_FeatureKey_Name",
                schema: "rpt",
                table: "ReportTemplates",
                columns: new[] { "TenantId", "FeatureKey", "Name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReportRoleGrants_CrystalReports_CrystalReportId",
                schema: "rpt",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId",
                principalSchema: "rpt",
                principalTable: "CrystalReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReports_CrystalReportVersions_CurrentPublishedVersionId",
                schema: "rpt",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId",
                principalSchema: "rpt",
                principalTable: "CrystalReportVersions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                schema: "rpt",
                table: "CrystalReportVersions");

            migrationBuilder.DropTable(
                name: "CrystalReportRoleGrants",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "ReportsDetails",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "ReportTemplateRevisions",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "ReportMasters",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "ReportTemplates",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "ReportsCategories",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "CrystalReports",
                schema: "rpt");

            migrationBuilder.DropTable(
                name: "CrystalReportVersions",
                schema: "rpt");
        }
    }
}
