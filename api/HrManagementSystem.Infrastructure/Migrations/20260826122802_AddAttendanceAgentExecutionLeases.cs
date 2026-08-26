using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAttendanceAgentExecutionLeases : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AttemptCount",
                table: "DevicePullRuns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<Guid>(
                name: "ClaimedByAttendanceAgentId",
                table: "DevicePullRuns",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LeaseExpiresAtUtc",
                table: "DevicePullRuns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_ClaimedByAttendanceAgentId_LeaseExpiresAtUtc",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "ClaimedByAttendanceAgentId", "LeaseExpiresAtUtc" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_ClaimedByAttendanceAgentId_LeaseExpiresAtUtc",
                table: "DevicePullRuns");

            migrationBuilder.DropColumn(
                name: "AttemptCount",
                table: "DevicePullRuns");

            migrationBuilder.DropColumn(
                name: "ClaimedByAttendanceAgentId",
                table: "DevicePullRuns");

            migrationBuilder.DropColumn(
                name: "LeaseExpiresAtUtc",
                table: "DevicePullRuns");
        }
    }
}
