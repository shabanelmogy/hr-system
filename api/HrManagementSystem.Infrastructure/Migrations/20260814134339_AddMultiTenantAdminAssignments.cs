using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenantAdminAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserTenantAccesses",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenantAccesses", x => new { x.UserId, x.TenantId });
                    table.ForeignKey(
                        name: "FK_UserTenantAccesses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserTenantAccesses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.Sql(
                """
                INSERT INTO [UserTenantAccesses] ([UserId], [TenantId], [IsDefault], [CreatedOn])
                SELECT [Id], [TenantId], CAST(1 AS bit), SYSUTCDATETIME()
                FROM [AspNetUsers]
                """);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenantAccesses_TenantId",
                table: "UserTenantAccesses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenantAccesses_TenantId_IsDefault",
                table: "UserTenantAccesses",
                columns: new[] { "TenantId", "IsDefault" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserTenantAccesses");
        }
    }
}
