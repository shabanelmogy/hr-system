using HrManagementSystem.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260712120000_ProfilePicture_BlobToFilename")]
public partial class ProfilePicture_BlobToFilename : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ProfilePicture",
            table: "AspNetUsers");

        migrationBuilder.AddColumn<string>(
            name: "ProfilePicture",
            table: "AspNetUsers",
            type: "nvarchar(260)",
            maxLength: 260,
            nullable: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ProfilePicture",
            table: "AspNetUsers");

        migrationBuilder.AddColumn<byte[]>(
            name: "ProfilePicture",
            table: "AspNetUsers",
            type: "varbinary(max)",
            nullable: true);
    }
}
