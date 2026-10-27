using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Platform.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemUiLocalization : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemLocalizationSettings",
                schema: "platform",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false),
                    Revision = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemLocalizationSettings", x => x.Id);
                    table.CheckConstraint("CK_SystemLocalizationSettings_Singleton", "[Id] = 1");
                });

            migrationBuilder.CreateTable(
                name: "SystemLocalizationOverrides",
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
                    table.PrimaryKey("PK_SystemLocalizationOverrides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SystemLocalizationOverrides_SystemLocalizationSettings_SettingsId",
                        column: x => x.SettingsId,
                        principalSchema: "platform",
                        principalTable: "SystemLocalizationSettings",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SystemLocalizationOverrides_SettingsId_Source_Language_Key",
                schema: "platform",
                table: "SystemLocalizationOverrides",
                columns: new[] { "SettingsId", "Source", "Language", "Key" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemLocalizationOverrides",
                schema: "platform");

            migrationBuilder.DropTable(
                name: "SystemLocalizationSettings",
                schema: "platform");
        }
    }
}
