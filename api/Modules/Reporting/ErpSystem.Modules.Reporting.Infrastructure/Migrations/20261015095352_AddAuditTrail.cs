using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Reporting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditTrail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditTrailEntries",
                schema: "rpt",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    EntityName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntityKey = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    EntityDisplay = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: true),
                    Action = table.Column<byte>(type: "tinyint", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    OccurredOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CorrelationId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ChangeCount = table.Column<int>(type: "int", nullable: false),
                    ChangesJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditTrailEntries", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditTrailEntries_TenantId_EntityName_EntityKey",
                schema: "rpt",
                table: "AuditTrailEntries",
                columns: new[] { "TenantId", "EntityName", "EntityKey" });

            migrationBuilder.CreateIndex(
                name: "IX_AuditTrailEntries_TenantId_OccurredOnUtc_Id",
                schema: "rpt",
                table: "AuditTrailEntries",
                columns: new[] { "TenantId", "OccurredOnUtc", "Id" },
                descending: new[] { false, true, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditTrailEntries",
                schema: "rpt");
        }
    }
}
