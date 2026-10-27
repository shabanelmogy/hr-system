using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddErrorLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ErrorLogEntries",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OccurredOnUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Source = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Service = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    StatusCode = table.Column<int>(type: "int", nullable: true),
                    DurationMs = table.Column<long>(type: "bigint", nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    Summary = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Client = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Browser = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    MethodFramesJson = table.Column<string>(type: "nvarchar(max)", maxLength: 4096, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLogEntries", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ErrorLogRetentionSettings",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    RetentionDays = table.Column<int>(type: "int", nullable: false),
                    Revision = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ErrorLogRetentionSettings", x => x.Id);
                    table.CheckConstraint("CK_ErrorLogRetentionSettings_Days", "[RetentionDays] BETWEEN 1 AND 3650");
                    table.CheckConstraint("CK_ErrorLogRetentionSettings_Id", "[Id] = 1");
                });

            migrationBuilder.InsertData(
                schema: "platform",
                table: "ErrorLogRetentionSettings",
                columns: new[] { "Id", "RetentionDays", "Revision" },
                values: new object[] { 1, 90, 0L });

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogEntries_OccurredOnUtc_Id",
                schema: "platform",
                table: "ErrorLogEntries",
                columns: new[] { "OccurredOnUtc", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogEntries_Source_OccurredOnUtc",
                schema: "platform",
                table: "ErrorLogEntries",
                columns: new[] { "Source", "OccurredOnUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ErrorLogEntries_TenantId_CompanyId_OccurredOnUtc_Id",
                schema: "platform",
                table: "ErrorLogEntries",
                columns: new[] { "TenantId", "CompanyId", "OccurredOnUtc", "Id" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ErrorLogEntries",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "ErrorLogRetentionSettings",
                schema: "platform");
        }
    }
}
