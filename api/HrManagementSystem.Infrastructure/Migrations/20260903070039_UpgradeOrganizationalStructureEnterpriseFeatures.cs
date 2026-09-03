using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpgradeOrganizationalStructureEnterpriseFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                table: "Departments");

            migrationBuilder.AddColumn<string>(
                name: "DutySections",
                table: "JobDescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EducationRequirements",
                table: "JobDescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Skills",
                table: "JobDescriptions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "BranchId",
                table: "Departments",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "ParentCompanyId",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameAr" },
                unique: true,
                filter: "[BranchId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameEn" },
                unique: true,
                filter: "[BranchId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_NameAr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true,
                filter: "[BranchId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_NameEn",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true,
                filter: "[BranchId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_ParentCompanyId",
                table: "Companies",
                column: "ParentCompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId",
                table: "Companies",
                column: "ParentCompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Companies_ParentCompanyId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_NameAr",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_TenantId_CompanyId_NameEn",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Companies_ParentCompanyId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "DutySections",
                table: "JobDescriptions");

            migrationBuilder.DropColumn(
                name: "EducationRequirements",
                table: "JobDescriptions");

            migrationBuilder.DropColumn(
                name: "Skills",
                table: "JobDescriptions");

            migrationBuilder.DropColumn(
                name: "ParentCompanyId",
                table: "Companies");

            migrationBuilder.AlterColumn<int>(
                name: "BranchId",
                table: "Departments",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

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
        }
    }
}
