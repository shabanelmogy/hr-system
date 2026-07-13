using HrManagementSystem.Infrastructure.Persistance;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260713143000_FixCountryNotificationActionUrl")]
public partial class FixCountryNotificationActionUrl : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE [Notifications]
            SET [ActionUrl] = '/basic-data/countries'
            WHERE [ActionUrl] = '/basic-data/geographical-information/countries';
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // This is a one-way data repair. Reintroducing the invalid URL would break navigation.
    }
}
