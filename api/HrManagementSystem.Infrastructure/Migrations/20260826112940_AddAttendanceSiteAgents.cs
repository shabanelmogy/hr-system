using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceSiteAgents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "AttendanceAgentId",
                table: "AttendanceDevices",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AttendanceAgents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    SecretHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SecretPrefix = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastSeenAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
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
                    table.PrimaryKey("PK_AttendanceAgents", x => x.Id);
                    table.UniqueConstraint("AK_AttendanceAgents_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_AttendanceAgentId",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "AttendanceAgentId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_CreatedById",
                table: "AttendanceAgents",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_DeletedById",
                table: "AttendanceAgents",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_SecretHash",
                table: "AttendanceAgents",
                column: "SecretHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId",
                table: "AttendanceAgents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId_NormalizedName",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_UpdatedById",
                table: "AttendanceAgents",
                column: "UpdatedById");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceDevices_AttendanceAgents_TenantId_CompanyId_AttendanceAgentId",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "AttendanceAgentId" },
                principalTable: "AttendanceAgents",
                principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceDevices_AttendanceAgents_TenantId_CompanyId_AttendanceAgentId",
                table: "AttendanceDevices");

            migrationBuilder.DropTable(
                name: "AttendanceAgents");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_AttendanceAgentId",
                table: "AttendanceDevices");

            migrationBuilder.DropColumn(
                name: "AttendanceAgentId",
                table: "AttendanceDevices");
        }
    }
}
