using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHireEmployeeRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_EmployeeId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.AddForeignKey(
                name: "FK_EmploymentApplications_Employees_TenantId_CompanyId_EmployeeId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" },
                principalTable: "Employees",
                principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EmploymentApplications_Employees_TenantId_CompanyId_EmployeeId",
                table: "EmploymentApplications");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_EmployeeId",
                table: "EmploymentApplications");
        }
    }
}
