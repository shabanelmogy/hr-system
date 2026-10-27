using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyMessageLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MessageLogEntries",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    StartedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CompletedOnUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    TemplateId = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Recipient = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: false),
                    SnapshotHtml = table.Column<string>(type: "nvarchar(max)", maxLength: 65536, nullable: true),
                    SnapshotTruncated = table.Column<bool>(type: "bit", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Phase = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Cause = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    SmtpStatusCode = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MessageLogEntries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MessageLogEntries_Companies_CompanyId",
                        column: x => x.CompanyId,
                        principalSchema: "platform",
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MessageLogEntries_CompanyId",
                schema: "platform",
                table: "MessageLogEntries",
                column: "CompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_MessageLogEntries_TenantId_CompanyId_StartedOnUtc_Id",
                schema: "platform",
                table: "MessageLogEntries",
                columns: new[] { "TenantId", "CompanyId", "StartedOnUtc", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_MessageLogEntries_TenantId_CompanyId_Status_StartedOnUtc",
                schema: "platform",
                table: "MessageLogEntries",
                columns: new[] { "TenantId", "CompanyId", "Status", "StartedOnUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MessageLogEntries",
                schema: "platform");
        }
    }
}
