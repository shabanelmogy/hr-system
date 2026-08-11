using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RecipientUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    RequiredPermission = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TitleKey = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MessageKey = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ParametersJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeduplicationKey = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DismissedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveredOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveryAttempts = table.Column<int>(type: "int", nullable: false),
                    NextDeliveryAttemptOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeliveryClaimedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastDeliveryError = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorUserId",
                table: "Notifications",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_DeliveredOn_NextDeliveryAttemptOn_DeliveryClaimedUntil",
                table: "Notifications",
                columns: new[] { "DeliveredOn", "NextDeliveryAttemptOn", "DeliveryClaimedUntil" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_CreatedOn_Id",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "CreatedOn", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_DeduplicationKey",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "DeduplicationKey" },
                unique: true,
                filter: "[DeduplicationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_ReadOn",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "ReadOn" },
                filter: "[DismissedOn] IS NULL AND [ReadOn] IS NULL");

        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");
        }
    }
}
