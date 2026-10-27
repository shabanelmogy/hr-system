using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyEmailTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyEmailTemplateSettings",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    Revision = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyEmailTemplateSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CompanyEmailTemplateOverrides",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TemplateId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", maxLength: 50000, nullable: false),
                    SettingsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyEmailTemplateOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyEmailTemplateOverrides_CompanyEmailTemplateSettings_SettingsId",
                        column: x => x.SettingsId,
                        principalSchema: "platform",
                        principalTable: "CompanyEmailTemplateSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyEmailTemplateOverrides_SettingsId_TemplateId_Language",
                schema: "platform",
                table: "CompanyEmailTemplateOverrides",
                columns: new[] { "SettingsId", "TemplateId", "Language" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyEmailTemplateSettings_TenantId_CompanyId",
                schema: "platform",
                table: "CompanyEmailTemplateSettings",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyEmailTemplateOverrides",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "CompanyEmailTemplateSettings",
                schema: "platform");
        }
    }
}
