using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Accounting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPartyReferenceProjection : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PartyReferences",
                schema: "acc",
                columns: table => new
                {
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    SourceEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceOccurredOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyReferences", x => new { x.TenantId, x.CompanyId, x.PartyId });
                });

            migrationBuilder.CreateIndex(
                name: "IX_PartyReferences_PartyId",
                schema: "acc",
                table: "PartyReferences",
                column: "PartyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PartyReferences",
                schema: "acc");
        }
    }
}
