using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantModuleEntitlements : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantModuleEntitlements",
                schema: "hr",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantModuleEntitlements", x => new { x.TenantId, x.ModuleCode });
                    table.ForeignKey(
                        name: "FK_TenantModuleEntitlements_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "hr",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantSubmoduleEntitlements",
                schema: "hr",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ModuleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SubmoduleCode = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantSubmoduleEntitlements", x => new { x.TenantId, x.ModuleCode, x.SubmoduleCode });
                    table.ForeignKey(
                        name: "FK_TenantSubmoduleEntitlements_TenantModuleEntitlements_TenantId_ModuleCode",
                        columns: x => new { x.TenantId, x.ModuleCode },
                        principalSchema: "hr",
                        principalTable: "TenantModuleEntitlements",
                        principalColumns: new[] { "TenantId", "ModuleCode" },
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantModuleEntitlements_TenantId",
                schema: "hr",
                table: "TenantModuleEntitlements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantSubmoduleEntitlements_TenantId",
                schema: "hr",
                table: "TenantSubmoduleEntitlements",
                column: "TenantId");

            // Existing tenants keep their current behaviour: all implemented HR
            // submodules are enabled unless an administrator later narrows the
            // commercial subscription explicitly.
            migrationBuilder.Sql("""
                INSERT INTO [hr].[TenantModuleEntitlements] ([TenantId], [ModuleCode])
                SELECT [Id], N'hr' FROM [hr].[Tenants] t
                WHERE NOT EXISTS (
                    SELECT 1 FROM [hr].[TenantModuleEntitlements] e
                    WHERE e.[TenantId] = t.[Id] AND e.[ModuleCode] = N'hr');

                INSERT INTO [hr].[TenantSubmoduleEntitlements] ([TenantId], [ModuleCode], [SubmoduleCode])
                SELECT t.[Id], N'hr', v.[Code]
                FROM [hr].[Tenants] t
                CROSS JOIN (VALUES
                    (N'basic-data'), (N'recruitment'), (N'workforce'),
                    (N'attendance'), (N'analytics'), (N'administration'),
                    (N'collaboration')) v([Code])
                WHERE NOT EXISTS (
                    SELECT 1 FROM [hr].[TenantSubmoduleEntitlements] e
                    WHERE e.[TenantId] = t.[Id]
                      AND e.[ModuleCode] = N'hr'
                      AND e.[SubmoduleCode] = v.[Code]);
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantSubmoduleEntitlements",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "TenantModuleEntitlements",
                schema: "hr");
        }
    }
}
