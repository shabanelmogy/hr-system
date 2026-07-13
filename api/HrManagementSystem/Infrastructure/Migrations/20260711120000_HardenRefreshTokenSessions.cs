using HrManagementSystem.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260711120000_HardenRefreshTokenSessions")]
public partial class HardenRefreshTokenSessions : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Existing tokens were stored in plaintext and cannot be trusted after key rotation.
        migrationBuilder.Sql("DELETE FROM [RefreshToken]");

        migrationBuilder.RenameColumn(
            name: "Token",
            table: "RefreshToken",
            newName: "TokenHash");

        migrationBuilder.AlterColumn<string>(
            name: "TokenHash",
            table: "RefreshToken",
            type: "nvarchar(64)",
            maxLength: 64,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(max)");

        migrationBuilder.AddColumn<string>(
            name: "SessionId",
            table: "RefreshToken",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "JwtId",
            table: "RefreshToken",
            type: "nvarchar(36)",
            maxLength: 36,
            nullable: false,
            defaultValue: "");

        migrationBuilder.AddColumn<string>(
            name: "ReplacedByTokenHash",
            table: "RefreshToken",
            type: "nvarchar(64)",
            maxLength: 64,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "RevocationReason",
            table: "RefreshToken",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "CreatedByIp",
            table: "RefreshToken",
            type: "nvarchar(45)",
            maxLength: 45,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "CreatedByUserAgent",
            table: "RefreshToken",
            type: "nvarchar(256)",
            maxLength: 256,
            nullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_RefreshToken_SessionId",
            table: "RefreshToken",
            column: "SessionId");

        migrationBuilder.CreateIndex(
            name: "IX_RefreshToken_TokenHash",
            table: "RefreshToken",
            column: "TokenHash",
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_RefreshToken_SessionId", table: "RefreshToken");
        migrationBuilder.DropIndex(name: "IX_RefreshToken_TokenHash", table: "RefreshToken");

        migrationBuilder.DropColumn(name: "SessionId", table: "RefreshToken");
        migrationBuilder.DropColumn(name: "JwtId", table: "RefreshToken");
        migrationBuilder.DropColumn(name: "ReplacedByTokenHash", table: "RefreshToken");
        migrationBuilder.DropColumn(name: "RevocationReason", table: "RefreshToken");
        migrationBuilder.DropColumn(name: "CreatedByIp", table: "RefreshToken");
        migrationBuilder.DropColumn(name: "CreatedByUserAgent", table: "RefreshToken");

        migrationBuilder.AlterColumn<string>(
            name: "TokenHash",
            table: "RefreshToken",
            type: "nvarchar(max)",
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(64)",
            oldMaxLength: 64);

        migrationBuilder.RenameColumn(
            name: "TokenHash",
            table: "RefreshToken",
            newName: "Token");
    }
}
