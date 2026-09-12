using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJobOfferApprovalGovernance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers");

            migrationBuilder.AddColumn<decimal>(
                name: "AnnualSalarySnapshot",
                table: "JobOffers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalDecisionReason",
                table: "JobOffers",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovalSubmittedById",
                table: "JobOffers",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ApprovalSubmittedOn",
                table: "JobOffers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ApprovedById",
                table: "JobOffers",
                type: "nvarchar(450)",
                maxLength: 450,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ApprovedOn",
                table: "JobOffers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CalculationPolicyVersion",
                table: "JobOffers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FiscalYearCostSnapshot",
                table: "JobOffers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ReservationDelta",
                table: "JobOffers",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "JobOfferApprovalHistory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JobOfferId = table.Column<int>(type: "int", nullable: false),
                    Action = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    OccurredOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: false),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobOfferApprovalHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_JobOffers_TenantId_CompanyId_JobOfferId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOfferId },
                        principalTable: "JobOffers",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOfferApprovalHistory_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3, 7, 8)");

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_CreatedById",
                table: "JobOfferApprovalHistory",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_DeletedById",
                table: "JobOfferApprovalHistory",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId",
                table: "JobOfferApprovalHistory",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId_CompanyId",
                table: "JobOfferApprovalHistory",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId_CompanyId_JobOfferId_OccurredOn",
                table: "JobOfferApprovalHistory",
                columns: new[] { "TenantId", "CompanyId", "JobOfferId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_UpdatedById",
                table: "JobOfferApprovalHistory",
                column: "UpdatedById");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "JobOfferApprovalHistory");

            migrationBuilder.DropIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "AnnualSalarySnapshot",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ApprovalDecisionReason",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ApprovalSubmittedById",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ApprovalSubmittedOn",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ApprovedById",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ApprovedOn",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "CalculationPolicyVersion",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "FiscalYearCostSnapshot",
                table: "JobOffers");

            migrationBuilder.DropColumn(
                name: "ReservationDelta",
                table: "JobOffers");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3)");
        }
    }
}
