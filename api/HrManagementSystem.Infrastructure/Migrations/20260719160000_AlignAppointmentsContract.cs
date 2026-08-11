using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260719160000_AlignAppointmentsContract")]
public partial class AlignAppointmentsContract : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsAllDay",
            table: "Appointments",
            type: "bit",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AlterColumn<DateTimeOffset>(
            name: "Start",
            table: "Appointments",
            type: "datetimeoffset",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "datetime2");

        migrationBuilder.AlterColumn<DateTimeOffset>(
            name: "End",
            table: "Appointments",
            type: "datetimeoffset",
            nullable: false,
            oldClrType: typeof(DateTime),
            oldType: "datetime2");

        migrationBuilder.AlterColumn<string>(
            name: "Text",
            table: "Appointments",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(400)",
            oldMaxLength: 400);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AlterColumn<DateTime>(
            name: "Start",
            table: "Appointments",
            type: "datetime2",
            nullable: false,
            oldClrType: typeof(DateTimeOffset),
            oldType: "datetimeoffset");

        migrationBuilder.AlterColumn<DateTime>(
            name: "End",
            table: "Appointments",
            type: "datetime2",
            nullable: false,
            oldClrType: typeof(DateTimeOffset),
            oldType: "datetimeoffset");

        migrationBuilder.AlterColumn<string>(
            name: "Text",
            table: "Appointments",
            type: "nvarchar(400)",
            maxLength: 400,
            nullable: false,
            oldClrType: typeof(string),
            oldType: "nvarchar(200)",
            oldMaxLength: 200);

        migrationBuilder.DropColumn(
            name: "IsAllDay",
            table: "Appointments");
    }
}
