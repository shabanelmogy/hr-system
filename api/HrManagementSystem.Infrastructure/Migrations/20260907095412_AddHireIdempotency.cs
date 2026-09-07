using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHireIdempotency : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HireIdempotencyKey",
                table: "EmploymentApplications",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_HireIdempotencyKey",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "HireIdempotencyKey" },
                unique: true,
                filter: "[HireIdempotencyKey] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_HireIdempotencyKey",
                table: "EmploymentApplications");

            migrationBuilder.DropColumn(
                name: "HireIdempotencyKey",
                table: "EmploymentApplications");
        }
    }
}
