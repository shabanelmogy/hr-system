using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationalStructureIdentityIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId",
                table: "Divisions");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId",
                table: "Departments");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleAr",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "TitleAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleEn",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "TitleEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameAr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameEn",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleAr",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "TitleAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleEn",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "TitleEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameAr",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameEn",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_NameAr",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_NameEn",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleAr",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleEn",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameAr",
                table: "JobLevels");

            migrationBuilder.DropIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameEn",
                table: "JobLevels");

            migrationBuilder.DropIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleAr",
                table: "JobDescriptions");

            migrationBuilder.DropIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleEn",
                table: "JobDescriptions");

            migrationBuilder.DropIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameAr",
                table: "Divisions");

            migrationBuilder.DropIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameEn",
                table: "Divisions");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Branches_TenantId_CompanyId_NameAr",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_TenantId_CompanyId_NameEn",
                table: "Branches");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });
        }
    }
}
