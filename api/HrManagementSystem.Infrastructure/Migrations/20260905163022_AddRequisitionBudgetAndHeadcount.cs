using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRequisitionBudgetAndHeadcount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BudgetJustification",
                table: "JobRequisitions",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsBudgeted",
                table: "JobRequisitions",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "ReplacementEmployeeId",
                table: "JobRequisitions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "JobRequisitions",
                type: "int",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_ReplacementEmployeeId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "ReplacementEmployeeId" });

            migrationBuilder.AddForeignKey(
                name: "FK_JobRequisitions_Employees_TenantId_CompanyId_ReplacementEmployeeId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "ReplacementEmployeeId" },
                principalTable: "Employees",
                principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobRequisitions_Employees_TenantId_CompanyId_ReplacementEmployeeId",
                table: "JobRequisitions");

            migrationBuilder.DropIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_ReplacementEmployeeId",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "BudgetJustification",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "IsBudgeted",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "ReplacementEmployeeId",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "JobRequisitions");
        }
    }
}
