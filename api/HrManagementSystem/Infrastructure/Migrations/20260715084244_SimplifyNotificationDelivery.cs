using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyNotificationDelivery : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_DeliveredOn_NextDeliveryAttemptOn_DeliveryClaimedUntil",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DeliveredOn",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DeliveryAttempts",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "DeliveryClaimedUntil",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "LastDeliveryError",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "NextDeliveryAttemptOn",
                table: "Notifications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DeliveredOn",
                table: "Notifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeliveryAttempts",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeliveryClaimedUntil",
                table: "Notifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastDeliveryError",
                table: "Notifications",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NextDeliveryAttemptOn",
                table: "Notifications",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DeliveredOn_NextDeliveryAttemptOn_DeliveryClaimedUntil",
                table: "Notifications",
                columns: new[] { "DeliveredOn", "NextDeliveryAttemptOn", "DeliveryClaimedUntil" });
        }
    }
}
