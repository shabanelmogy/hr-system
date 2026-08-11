using System;
using HrManagementSystem.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20260811190000_AddTenantSubscriptionsAndSuperAdmin")]
public partial class AddTenantSubscriptionsAndSuperAdmin : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "BillingEmail",
            table: "Tenants",
            type: "nvarchar(256)",
            maxLength: 256,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ContactName",
            table: "Tenants",
            type: "nvarchar(200)",
            maxLength: 200,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "ContactPhone",
            table: "Tenants",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: true);

        migrationBuilder.AddColumn<int>(
            name: "MaxAdmins",
            table: "Tenants",
            type: "int",
            nullable: false,
            defaultValue: 1);

        migrationBuilder.AddColumn<int>(
            name: "MaxUsers",
            table: "Tenants",
            type: "int",
            nullable: false,
            defaultValue: 5);

        migrationBuilder.AddColumn<string>(
            name: "Notes",
            table: "Tenants",
            type: "nvarchar(2000)",
            maxLength: 2000,
            nullable: true);

        migrationBuilder.AddColumn<string>(
            name: "PlanName",
            table: "Tenants",
            type: "nvarchar(100)",
            maxLength: 100,
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "SubscriptionEndsOn",
            table: "Tenants",
            type: "datetime2",
            nullable: true);

        migrationBuilder.AddColumn<DateTime>(
            name: "SubscriptionStartedOn",
            table: "Tenants",
            type: "datetime2",
            nullable: false,
            defaultValueSql: "SYSUTCDATETIME()");

        migrationBuilder.AddColumn<string>(
            name: "SubscriptionStatus",
            table: "Tenants",
            type: "nvarchar(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "Free");

        migrationBuilder.AddColumn<DateTime>(
            name: "UpdatedOn",
            table: "Tenants",
            type: "datetime2",
            nullable: true);

        migrationBuilder.Sql(
            "UPDATE [Tenants] SET [SubscriptionStartedOn] = [CreatedOn]");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(name: "BillingEmail", table: "Tenants");
        migrationBuilder.DropColumn(name: "ContactName", table: "Tenants");
        migrationBuilder.DropColumn(name: "ContactPhone", table: "Tenants");
        migrationBuilder.DropColumn(name: "MaxAdmins", table: "Tenants");
        migrationBuilder.DropColumn(name: "MaxUsers", table: "Tenants");
        migrationBuilder.DropColumn(name: "Notes", table: "Tenants");
        migrationBuilder.DropColumn(name: "PlanName", table: "Tenants");
        migrationBuilder.DropColumn(name: "SubscriptionEndsOn", table: "Tenants");
        migrationBuilder.DropColumn(name: "SubscriptionStartedOn", table: "Tenants");
        migrationBuilder.DropColumn(name: "SubscriptionStatus", table: "Tenants");
        migrationBuilder.DropColumn(name: "UpdatedOn", table: "Tenants");
    }
}
