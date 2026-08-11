using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ApplyPragmaticDomainFoundation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_TenantId_CompanyId_Key",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "EmployeeCountExists",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "EmployeeCountNeeded",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "EmployeeCountTarget",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "IsLocked",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "KeyHash",
                table: "ApiKeys",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KeyPrefix",
                table: "ApiKeys",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RevocationReason",
                table: "ApiKeys",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RevokedAt",
                table: "ApiKeys",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [ApiKeys]
                SET [KeyHash] = CONVERT(varchar(64), HASHBYTES('SHA2_256', [Key]), 2),
                    [KeyPrefix] = LEFT([Key], 12);
                """);

            migrationBuilder.AlterColumn<string>(
                name: "KeyHash",
                table: "ApiKeys",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(64)",
                oldMaxLength: 64,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "KeyPrefix",
                table: "ApiKeys",
                type: "nvarchar(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(16)",
                oldMaxLength: 16,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Key",
                table: "ApiKeys");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_KeyHash",
                table: "ApiKeys",
                column: "KeyHash",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_KeyHash",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "RevocationReason",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "RevokedAt",
                table: "ApiKeys");

            migrationBuilder.AddColumn<int>(
                name: "EmployeeCountExists",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeCountNeeded",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "EmployeeCountTarget",
                table: "Companies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsLocked",
                table: "AspNetUsers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "Key",
                table: "ApiKeys",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.Sql(
                """
                UPDATE [ApiKeys]
                SET [Key] = CONCAT('legacy-', [Id]);
                """);

            migrationBuilder.AlterColumn<string>(
                name: "Key",
                table: "ApiKeys",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "KeyHash",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "KeyPrefix",
                table: "ApiKeys");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId_CompanyId_Key",
                table: "ApiKeys",
                columns: new[] { "TenantId", "CompanyId", "Key" },
                unique: true);
        }
    }
}
