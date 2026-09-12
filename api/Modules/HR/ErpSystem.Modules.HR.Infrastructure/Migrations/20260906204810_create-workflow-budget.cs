using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateWorkflowBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "WorkforceBudgets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BudgetCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WorkforcePlanId = table.Column<int>(type: "int", nullable: false),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CalculationPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SubmittedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RejectedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RejectedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ActivatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SupersededOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
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
                    table.PrimaryKey("PK_WorkforceBudgets", x => x.Id);
                    table.UniqueConstraint("AK_WorkforceBudgets_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgets_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceBudgetLines",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkforceBudgetId = table.Column<int>(type: "int", nullable: false),
                    WorkforcePlanLineId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: false),
                    AuthorizedHeadcount = table.Column<int>(type: "int", nullable: false),
                    AllocatedSalaryBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AllocatedRecruitmentBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                    table.PrimaryKey("PK_WorkforceBudgetLines", x => x.Id);
                    table.UniqueConstraint("AK_WorkforceBudgetLines_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_WorkforceBudgets_TenantId_CompanyId_WorkforceBudgetId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetId },
                        principalTable: "WorkforceBudgets",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PositionEnvelopes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnvelopeCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    WorkforceBudgetId = table.Column<int>(type: "int", nullable: false),
                    WorkforceBudgetLineId = table.Column<int>(type: "int", nullable: false),
                    WorkforcePlanId = table.Column<int>(type: "int", nullable: false),
                    WorkforcePlanLineId = table.Column<int>(type: "int", nullable: false),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CalculationPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AuthorizedHeadcount = table.Column<int>(type: "int", nullable: false),
                    ReservedHeadcount = table.Column<int>(type: "int", nullable: false),
                    HiredHeadcount = table.Column<int>(type: "int", nullable: false),
                    AuthorizedSalaryBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ReservedSalaryBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ContractedSalaryBudget = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                    table.PrimaryKey("PK_PositionEnvelopes", x => x.Id);
                    table.UniqueConstraint("AK_PositionEnvelopes_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetLineId },
                        principalTable: "WorkforceBudgetLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforceBudgets_TenantId_CompanyId_WorkforceBudgetId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetId },
                        principalTable: "WorkforceBudgets",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceBudgetPeriodAllocations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkforceBudgetLineId = table.Column<int>(type: "int", nullable: false),
                    FiscalPeriodId = table.Column<int>(type: "int", nullable: false),
                    TargetHeadcount = table.Column<int>(type: "int", nullable: false),
                    AllocatedSalaryCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AllocatedRecruitmentCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
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
                    table.PrimaryKey("PK_WorkforceBudgetPeriodAllocations", x => x.Id);
                    table.UniqueConstraint("AK_WorkforceBudgetPeriodAllocations_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_FiscalPeriods_TenantId_CompanyId_FiscalPeriodId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalPeriodId },
                        principalTable: "FiscalPeriods",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetPeriodAllocations_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetLineId },
                        principalTable: "WorkforceBudgetLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_CreatedById",
                table: "PositionEnvelopes",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_DeletedById",
                table: "PositionEnvelopes",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId",
                table: "PositionEnvelopes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_BranchId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_DepartmentId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_DivisionId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_EnvelopeCode",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "EnvelopeCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_FiscalYearId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_PositionId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforceBudgetId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforceBudgetLineId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetLineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforcePlanId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforcePlanLineId",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_UpdatedById",
                table: "PositionEnvelopes",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_CreatedById",
                table: "WorkforceBudgetLines",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_DeletedById",
                table: "WorkforceBudgetLines",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId",
                table: "WorkforceBudgetLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_BranchId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_DepartmentId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_DivisionId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_PositionId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetId_WorkforcePlanLineId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetId", "WorkforcePlanLineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_WorkforcePlanLineId",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_UpdatedById",
                table: "WorkforceBudgetLines",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_CreatedById",
                table: "WorkforceBudgetPeriodAllocations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_DeletedById",
                table: "WorkforceBudgetPeriodAllocations",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId",
                table: "WorkforceBudgetPeriodAllocations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId_CompanyId",
                table: "WorkforceBudgetPeriodAllocations",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId_CompanyId_FiscalPeriodId",
                table: "WorkforceBudgetPeriodAllocations",
                columns: new[] { "TenantId", "CompanyId", "FiscalPeriodId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId_CompanyId_WorkforceBudgetLineId_FiscalPeriodId",
                table: "WorkforceBudgetPeriodAllocations",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetLineId", "FiscalPeriodId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_UpdatedById",
                table: "WorkforceBudgetPeriodAllocations",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_CreatedById",
                table: "WorkforceBudgets",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_DeletedById",
                table: "WorkforceBudgets",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId",
                table: "WorkforceBudgets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId_FiscalYearId_BudgetCode",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "BudgetCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId_WorkforcePlanId",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_UpdatedById",
                table: "WorkforceBudgets",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "UX_WorkforceBudgets_OneEffectivePerFiscalYear",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId" },
                unique: true,
                filter: "[Status] = 3 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PositionEnvelopes");

            migrationBuilder.DropTable(
                name: "WorkforceBudgetPeriodAllocations");

            migrationBuilder.DropTable(
                name: "WorkforceBudgetLines");

            migrationBuilder.DropTable(
                name: "WorkforceBudgets");
        }
    }
}
