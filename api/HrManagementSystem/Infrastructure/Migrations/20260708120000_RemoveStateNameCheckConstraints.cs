using HrManagementSystem.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260708120000_RemoveStateNameCheckConstraints")]
public partial class RemoveStateNameCheckConstraints : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropCheckConstraint(
            name: "CHK_State_NameAr_ArabicOnly",
            table: "States");

        migrationBuilder.DropCheckConstraint(
            name: "CHK_State_NameEn_EnglishOnly",
            table: "States");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddCheckConstraint(
            name: "CHK_State_NameAr_ArabicOnly",
            table: "States",
            sql: "[NameAr] NOT LIKE N'%[^\uFFFD-\uFFFD ]%' COLLATE Arabic_CI_AS");

        migrationBuilder.AddCheckConstraint(
            name: "CHK_State_NameEn_EnglishOnly",
            table: "States",
            sql: "[NameEn] NOT LIKE '%[^A-Za-z ]%'");
    }
}
