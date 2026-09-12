using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfflineOperationsPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "platform");

            migrationBuilder.CreateTable(
                name: "OfflineOperationsPolicies",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    ModesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfflineOperationsPolicies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OfflineOperationsPolicyHistory",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PolicyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    PreviousModesJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewModesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ChangedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfflineOperationsPolicyHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfflineOperationsPolicyHistory_OfflineOperationsPolicies_PolicyId",
                        column: x => x.PolicyId,
                        principalSchema: "platform",
                        principalTable: "OfflineOperationsPolicies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfflineOperationsPolicies_TenantId_CompanyId",
                schema: "platform",
                table: "OfflineOperationsPolicies",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfflineOperationsPolicyHistory_PolicyId",
                schema: "platform",
                table: "OfflineOperationsPolicyHistory",
                column: "PolicyId");

            migrationBuilder.CreateIndex(
                name: "IX_OfflineOperationsPolicyHistory_TenantId_CompanyId_ChangedOn",
                schema: "platform",
                table: "OfflineOperationsPolicyHistory",
                columns: new[] { "TenantId", "CompanyId", "ChangedOn" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfflineOperationsPolicyHistory",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "OfflineOperationsPolicies",
                schema: "platform");
        }
    }
}
