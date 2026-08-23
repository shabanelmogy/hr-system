using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCrystalReportManager : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CrystalReportRoleGrants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Rights = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_CrystalReportRoleGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ReportKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CurrentPublishedVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrystalReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReports_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReportVersions",
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CrystalReportVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                        column: x => x.CrystalReportId,
                        principalTable: "CrystalReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_CreatedById",
                table: "CrystalReportRoleGrants",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_CrystalReportId",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_DeletedById",
                table: "CrystalReportRoleGrants",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_RoleId",
                table: "CrystalReportRoleGrants",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId",
                table: "CrystalReportRoleGrants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId_CrystalReportId_RoleId",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId", "CrystalReportId", "RoleId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_UpdatedById",
                table: "CrystalReportRoleGrants",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_CreatedById",
                table: "CrystalReports",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_CurrentPublishedVersionId",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_DeletedById",
                table: "CrystalReports",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId",
                table: "CrystalReports",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_IsDeleted_DisplayName",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "IsDeleted", "DisplayName" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_ReportKey",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "ReportKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_UpdatedById",
                table: "CrystalReports",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_CreatedById",
                table: "CrystalReportVersions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_CrystalReportId",
                table: "CrystalReportVersions",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_DeletedById",
                table: "CrystalReportVersions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId",
                table: "CrystalReportVersions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_CrystalReportId_VersionNumber",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "CrystalReportId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_StorageKey",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "StorageKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_UpdatedById",
                table: "CrystalReportVersions",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReportRoleGrants_CrystalReports_CrystalReportId",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId",
                principalTable: "CrystalReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReports_CrystalReportVersions_CurrentPublishedVersionId",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId",
                principalTable: "CrystalReportVersions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                table: "CrystalReportVersions");

            migrationBuilder.DropTable(
                name: "CrystalReportRoleGrants");

            migrationBuilder.DropTable(
                name: "CrystalReports");

            migrationBuilder.DropTable(
                name: "CrystalReportVersions");
        }
    }
}
