using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruitmentIntegrityFilteredIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                table: "EmploymentApplications");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3)");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "CandidateId", "JobOpeningId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3, 4, 5, 6, 7, 8, 9)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers");

            migrationBuilder.DropIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                table: "EmploymentApplications");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "CandidateId", "JobOpeningId" });
        }
    }
}
