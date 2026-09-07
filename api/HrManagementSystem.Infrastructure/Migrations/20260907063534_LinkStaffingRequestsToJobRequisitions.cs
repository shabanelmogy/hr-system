using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LinkStaffingRequestsToJobRequisitions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HiredPositions",
                table: "JobRequisitions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PlanningSource",
                table: "JobRequisitions",
                type: "int",
                nullable: false,
                defaultValue: 2);

            migrationBuilder.AddColumn<int>(
                name: "StaffingRequestId",
                table: "JobRequisitions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_StaffingRequestId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "StaffingRequestId" });

            migrationBuilder.AddForeignKey(
                name: "FK_JobRequisitions_StaffingRequests_TenantId_CompanyId_StaffingRequestId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "StaffingRequestId" },
                principalTable: "StaffingRequests",
                principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobRequisitions_StaffingRequests_TenantId_CompanyId_StaffingRequestId",
                table: "JobRequisitions");

            migrationBuilder.DropIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_StaffingRequestId",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "HiredPositions",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "PlanningSource",
                table: "JobRequisitions");

            migrationBuilder.DropColumn(
                name: "StaffingRequestId",
                table: "JobRequisitions");
        }
    }
}
