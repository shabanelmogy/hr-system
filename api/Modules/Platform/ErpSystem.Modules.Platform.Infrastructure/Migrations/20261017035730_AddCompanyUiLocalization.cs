using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyUiLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CompanyLocalizationSettings",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DefaultLanguage = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Revision = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyLocalizationSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyLocalizationSettings_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalSchema: "platform",
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyLocalizationOverrides",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Source = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Language = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Key = table.Column<string>(type: "nvarchar(400)", maxLength: 400, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    SettingsId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyLocalizationOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyLocalizationOverrides_CompanyLocalizationSettings_SettingsId",
                        column: x => x.SettingsId,
                        principalSchema: "platform",
                        principalTable: "CompanyLocalizationSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyLocalizationOverrides_SettingsId_Source_Language_Key",
                schema: "platform",
                table: "CompanyLocalizationOverrides",
                columns: new[] { "SettingsId", "Source", "Language", "Key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyLocalizationSettings_TenantId_CompanyId",
                schema: "platform",
                table: "CompanyLocalizationSettings",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CompanyLocalizationOverrides",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "CompanyLocalizationSettings",
                schema: "platform");
        }
    }
}
