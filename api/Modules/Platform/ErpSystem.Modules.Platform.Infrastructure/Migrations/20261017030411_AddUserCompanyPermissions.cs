using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserCompanyPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserCompanyPermissionGrantSets",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Revision = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompanyPermissionGrantSets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCompanyPermissionGrantSets_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalSchema: "platform",
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCompanyPermissionGrantSets_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalSchema: "platform",
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCompanyPermissionGrants",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Permission = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    GrantSetId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompanyPermissionGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserCompanyPermissionGrants_UserCompanyPermissionGrantSets_GrantSetId",
                        column: x => x.GrantSetId,
                        principalSchema: "platform",
                        principalTable: "UserCompanyPermissionGrantSets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyPermissionGrants_GrantSetId_Permission",
                schema: "platform",
                table: "UserCompanyPermissionGrants",
                columns: new[] { "GrantSetId", "Permission" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyPermissionGrantSets_TenantId_CompanyId_UserId",
                schema: "platform",
                table: "UserCompanyPermissionGrantSets",
                columns: new[] { "TenantId", "CompanyId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyPermissionGrantSets_UserId",
                schema: "platform",
                table: "UserCompanyPermissionGrantSets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserCompanyPermissionGrants",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "UserCompanyPermissionGrantSets",
                schema: "platform");
        }
    }
}
