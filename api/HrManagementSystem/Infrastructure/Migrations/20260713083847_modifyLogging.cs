using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

public partial class modifyLogging : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_UserLogins_AspNetUsers_UserId",
            table: "UserLogins");

        migrationBuilder.DropPrimaryKey(
            name: "PK_UserLogins",
            table: "UserLogins");

        migrationBuilder.RenameTable(
            name: "UserLogins",
            newName: "LoginAudits");

        migrationBuilder.RenameIndex(
            name: "IX_UserLogins_UserId",
            table: "LoginAudits",
            newName: "IX_LoginAudits_UserId");

        migrationBuilder.AddPrimaryKey(
            name: "PK_LoginAudits",
            table: "LoginAudits",
            column: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_LoginAudits_AspNetUsers_UserId",
            table: "LoginAudits",
            column: "UserId",
            principalTable: "AspNetUsers",
            principalColumn: "Id");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropForeignKey(
            name: "FK_LoginAudits_AspNetUsers_UserId",
            table: "LoginAudits");

        migrationBuilder.DropPrimaryKey(
            name: "PK_LoginAudits",
            table: "LoginAudits");

        migrationBuilder.RenameTable(
            name: "LoginAudits",
            newName: "UserLogins");

        migrationBuilder.RenameIndex(
            name: "IX_LoginAudits_UserId",
            table: "UserLogins",
            newName: "IX_UserLogins_UserId");

        migrationBuilder.AddPrimaryKey(
            name: "PK_UserLogins",
            table: "UserLogins",
            column: "Id");

        migrationBuilder.AddForeignKey(
            name: "FK_UserLogins_AspNetUsers_UserId",
            table: "UserLogins",
            column: "UserId",
            principalTable: "AspNetUsers",
            principalColumn: "Id");
    }
}
