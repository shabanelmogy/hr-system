using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class P1TenantUserFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ArchiveReason",
                table: "Tenants",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedOn",
                table: "Tenants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LifecycleStatus",
                table: "Tenants",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Active");

            migrationBuilder.AddColumn<DateTime>(
                name: "PurgeScheduledOn",
                table: "Tenants",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<byte[]>(
                name: "RowVersion",
                table: "Tenants",
                type: "rowversion",
                rowVersion: true,
                nullable: false,
                defaultValue: new byte[0]);

            migrationBuilder.AddColumn<string>(
                name: "ArchiveReason",
                table: "AspNetUsers",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ArchivedOn",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LifecycleStatus",
                table: "AspNetUsers",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "Active");

            migrationBuilder.CreateTable(
                name: "SecurityAuditEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Outcome = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditEvents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TenantId_LifecycleStatus",
                table: "AspNetUsers",
                columns: new[] { "TenantId", "LifecycleStatus" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_ActorUserId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "ActorUserId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_TargetType_TargetId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "TargetType", "TargetId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_TenantId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "TenantId", "OccurredOn" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SecurityAuditEvents");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_TenantId_LifecycleStatus",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ArchiveReason",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ArchivedOn",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "LifecycleStatus",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "PurgeScheduledOn",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "RowVersion",
                table: "Tenants");

            migrationBuilder.DropColumn(
                name: "ArchiveReason",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "ArchivedOn",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LifecycleStatus",
                table: "AspNetUsers");
        }
    }
}
