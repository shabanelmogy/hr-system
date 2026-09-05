using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruitmentModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Candidates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PortalUserId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DateOfBirth = table.Column<DateOnly>(type: "date", nullable: true),
                    NationalityCountryId = table.Column<int>(type: "int", nullable: true),
                    CurrentCountryId = table.Column<int>(type: "int", nullable: true),
                    CurrentStateId = table.Column<int>(type: "int", nullable: true),
                    City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LinkedInUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    PortfolioUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ResumeFileId = table.Column<int>(type: "int", nullable: true),
                    ConsentGrantedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PrivacyPolicyVersion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.UniqueConstraint("AK_Candidates_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Candidates_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Candidates_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Candidates_Countries_CurrentCountryId",
                        column: x => x.CurrentCountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_Countries_NationalityCountryId",
                        column: x => x.NationalityCountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_States_CurrentStateId",
                        column: x => x.CurrentStateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Candidates_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobRequisitions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RequisitionNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: true),
                    RequestedByEmployeeId = table.Column<int>(type: "int", nullable: false),
                    RequestedPositions = table.Column<int>(type: "int", nullable: false),
                    BusinessReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    EmploymentType = table.Column<int>(type: "int", nullable: false),
                    WorkArrangement = table.Column<int>(type: "int", nullable: false),
                    TargetHireDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ReviewedByEmployeeId = table.Column<int>(type: "int", nullable: true),
                    ReviewedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_JobRequisitions", x => x.Id);
                    table.UniqueConstraint("AK_JobRequisitions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobRequisitions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobRequisitions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobOpenings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OpeningNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    JobRequisitionId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: true),
                    PositionCount = table.Column<int>(type: "int", nullable: false),
                    HiredCount = table.Column<int>(type: "int", nullable: false),
                    EmploymentType = table.Column<int>(type: "int", nullable: false),
                    WorkArrangement = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    OpenedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ClosedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ClosureReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
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
                    table.PrimaryKey("PK_JobOpenings", x => x.Id);
                    table.UniqueConstraint("AK_JobOpenings_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobOpenings_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOpenings_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOpenings_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_JobRequisitions_TenantId_CompanyId_JobRequisitionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobRequisitionId },
                        principalTable: "JobRequisitions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobPostings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    JobOpeningId = table.Column<int>(type: "int", nullable: false),
                    Slug = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Audience = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponsibilitiesEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResponsibilitiesAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequirementsEn = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequirementsAr = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LocationTextEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    LocationTextAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    ScheduledPublishOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PublishedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ClosesOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ClosedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
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
                    table.PrimaryKey("PK_JobPostings", x => x.Id);
                    table.UniqueConstraint("AK_JobPostings_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobPostings_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobPostings_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobPostings_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobPostings_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobPostings_JobOpenings_TenantId_CompanyId_JobOpeningId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOpeningId },
                        principalTable: "JobOpenings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobPostings_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    JobOpeningId = table.Column<int>(type: "int", nullable: false),
                    JobPostingId = table.Column<int>(type: "int", nullable: true),
                    EmployeeId = table.Column<int>(type: "int", nullable: true),
                    Source = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CoverLetter = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ResumeFileId = table.Column<int>(type: "int", nullable: true),
                    ExpectedSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    ExpectedSalaryCurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    AvailableFrom = table.Column<DateOnly>(type: "date", nullable: true),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastStatusChangedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
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
                    table.PrimaryKey("PK_EmploymentApplications", x => x.Id);
                    table.UniqueConstraint("AK_EmploymentApplications_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_Candidates_TenantId_CandidateId",
                        columns: x => new { x.TenantId, x.CandidateId },
                        principalTable: "Candidates",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_JobOpenings_TenantId_CompanyId_JobOpeningId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOpeningId },
                        principalTable: "JobOpenings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_JobPostings_TenantId_CompanyId_JobPostingId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobPostingId },
                        principalTable: "JobPostings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationStatusHistories",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmploymentApplicationId = table.Column<int>(type: "int", nullable: false),
                    FromStatus = table.Column<int>(type: "int", nullable: true),
                    ToStatus = table.Column<int>(type: "int", nullable: false),
                    ChangedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ChangedByEmployeeId = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_ApplicationStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_EmploymentApplications_EmploymentApplicationId",
                        column: x => x.EmploymentApplicationId,
                        principalTable: "EmploymentApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmploymentApplicationId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StartsOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    EndsOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CompletedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LocationOrMeetingUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CancellationReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_Interviews", x => x.Id);
                    table.UniqueConstraint("AK_Interviews_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Interviews_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Interviews_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Interviews_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_EmploymentApplications_TenantId_CompanyId_EmploymentApplicationId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId },
                        principalTable: "EmploymentApplications",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Interviews_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobOffers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OfferNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    EmploymentApplicationId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: true),
                    BaseSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    PayFrequency = table.Column<int>(type: "int", nullable: false),
                    EmploymentType = table.Column<int>(type: "int", nullable: false),
                    WorkArrangement = table.Column<int>(type: "int", nullable: false),
                    ProposedStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    TermsAndConditions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    IssuedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ExpiresOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RespondedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ResponseReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
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
                    table.PrimaryKey("PK_JobOffers", x => x.Id);
                    table.UniqueConstraint("AK_JobOffers_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobOffers_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOffers_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobOffers_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_EmploymentApplications_TenantId_CompanyId_EmploymentApplicationId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId },
                        principalTable: "EmploymentApplications",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewEvaluations",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    InterviewerEmployeeId = table.Column<int>(type: "int", nullable: false),
                    Score = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Recommendation = table.Column<int>(type: "int", nullable: false),
                    Comments = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
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
                    table.PrimaryKey("PK_InterviewEvaluations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewParticipants",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    IsLead = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_InterviewParticipants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_CreatedById",
                table: "ApplicationStatusHistories",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_DeletedById",
                table: "ApplicationStatusHistories",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_EmploymentApplicationId",
                table: "ApplicationStatusHistories",
                column: "EmploymentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId",
                table: "ApplicationStatusHistories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId_CompanyId",
                table: "ApplicationStatusHistories",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId_CompanyId_EmploymentApplicationId",
                table: "ApplicationStatusHistories",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_UpdatedById",
                table: "ApplicationStatusHistories",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CreatedById",
                table: "Candidates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CurrentCountryId",
                table: "Candidates",
                column: "CurrentCountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_CurrentStateId",
                table: "Candidates",
                column: "CurrentStateId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_DeletedById",
                table: "Candidates",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_NationalityCountryId",
                table: "Candidates",
                column: "NationalityCountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId",
                table: "Candidates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_Email",
                table: "Candidates",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_PhoneNumber",
                table: "Candidates",
                columns: new[] { "TenantId", "PhoneNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_PortalUserId",
                table: "Candidates",
                columns: new[] { "TenantId", "PortalUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_UpdatedById",
                table: "Candidates",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_CreatedById",
                table: "EmploymentApplications",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_DeletedById",
                table: "EmploymentApplications",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId",
                table: "EmploymentApplications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CandidateId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CandidateId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "CandidateId", "JobOpeningId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_JobOpeningId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "JobOpeningId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_JobPostingId",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "JobPostingId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_Status",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_UpdatedById",
                table: "EmploymentApplications",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_CreatedById",
                table: "InterviewEvaluations",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_DeletedById",
                table: "InterviewEvaluations",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_InterviewId_InterviewerEmployeeId",
                table: "InterviewEvaluations",
                columns: new[] { "InterviewId", "InterviewerEmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId",
                table: "InterviewEvaluations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId_CompanyId",
                table: "InterviewEvaluations",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId_CompanyId_InterviewId",
                table: "InterviewEvaluations",
                columns: new[] { "TenantId", "CompanyId", "InterviewId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_UpdatedById",
                table: "InterviewEvaluations",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_CreatedById",
                table: "InterviewParticipants",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_DeletedById",
                table: "InterviewParticipants",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_InterviewId_EmployeeId",
                table: "InterviewParticipants",
                columns: new[] { "InterviewId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId",
                table: "InterviewParticipants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId_CompanyId",
                table: "InterviewParticipants",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId_CompanyId_InterviewId",
                table: "InterviewParticipants",
                columns: new[] { "TenantId", "CompanyId", "InterviewId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_UpdatedById",
                table: "InterviewParticipants",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_CreatedById",
                table: "Interviews",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_DeletedById",
                table: "Interviews",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId",
                table: "Interviews",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_EmploymentApplicationId",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_StartsOn",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "StartsOn" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_Status",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_UpdatedById",
                table: "Interviews",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_CreatedById",
                table: "JobOffers",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_DeletedById",
                table: "JobOffers",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId",
                table: "JobOffers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_BranchId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_DepartmentId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_DivisionId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_OfferNumber",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "OfferNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_PositionId",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_Status",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_UpdatedById",
                table: "JobOffers",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_CreatedById",
                table: "JobOpenings",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_DeletedById",
                table: "JobOpenings",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId",
                table: "JobOpenings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_BranchId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_DepartmentId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_DivisionId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_JobRequisitionId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "JobRequisitionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_OpeningNumber",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "OpeningNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_PositionId",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_Status",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_UpdatedById",
                table: "JobOpenings",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_CreatedById",
                table: "JobPostings",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_DeletedById",
                table: "JobPostings",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId",
                table: "JobPostings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_JobOpeningId",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "JobOpeningId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_Slug",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_Status",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_UpdatedById",
                table: "JobPostings",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_CreatedById",
                table: "JobRequisitions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_DeletedById",
                table: "JobRequisitions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId",
                table: "JobRequisitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_BranchId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_DepartmentId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_DivisionId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_PositionId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_RequisitionNumber",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "RequisitionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_Status",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_UpdatedById",
                table: "JobRequisitions",
                column: "UpdatedById");

            migrationBuilder.Sql(
                """
                INSERT INTO [AspNetRoleClaims] ([RoleId], [ClaimType], [ClaimValue])
                SELECT [role].[Id], N'Permissions', [permission].[Value]
                FROM [AspNetRoles] AS [role]
                CROSS JOIN (VALUES
                    (N'Recruitment:View'),
                    (N'Recruitment:ManageJobRequisitions'),
                    (N'Recruitment:ApproveJobRequisitions'),
                    (N'Recruitment:ManageJobOpenings'),
                    (N'Recruitment:ManageJobPostings'),
                    (N'Recruitment:ManageCandidates'),
                    (N'Recruitment:ManageApplications'),
                    (N'Recruitment:EvaluateInterviews'),
                    (N'Recruitment:ManageJobOffers'),
                    (N'Recruitment:ApproveJobOffers'),
                    (N'Recruitment:HireCandidate')
                ) AS [permission]([Value])
                WHERE [role].[IsSystem] = CAST(1 AS bit)
                  AND [role].[NormalizedName] = N'ADMIN'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM [AspNetRoleClaims] AS [existing]
                      WHERE [existing].[RoleId] = [role].[Id]
                        AND [existing].[ClaimType] = N'Permissions'
                        AND [existing].[ClaimValue] = [permission].[Value]
                  );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE [claim]
                FROM [AspNetRoleClaims] AS [claim]
                INNER JOIN [AspNetRoles] AS [role] ON [role].[Id] = [claim].[RoleId]
                WHERE [role].[IsSystem] = CAST(1 AS bit)
                  AND [role].[NormalizedName] = N'ADMIN'
                  AND [claim].[ClaimType] = N'Permissions'
                  AND [claim].[ClaimValue] IN (
                      N'Recruitment:View',
                      N'Recruitment:ManageJobRequisitions',
                      N'Recruitment:ApproveJobRequisitions',
                      N'Recruitment:ManageJobOpenings',
                      N'Recruitment:ManageJobPostings',
                      N'Recruitment:ManageCandidates',
                      N'Recruitment:ManageApplications',
                      N'Recruitment:EvaluateInterviews',
                      N'Recruitment:ManageJobOffers',
                      N'Recruitment:ApproveJobOffers',
                      N'Recruitment:HireCandidate'
                  );
                """);

            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories");

            migrationBuilder.DropTable(
                name: "InterviewEvaluations");

            migrationBuilder.DropTable(
                name: "InterviewParticipants");

            migrationBuilder.DropTable(
                name: "JobOffers");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "EmploymentApplications");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "JobPostings");

            migrationBuilder.DropTable(
                name: "JobOpenings");

            migrationBuilder.DropTable(
                name: "JobRequisitions");
        }
    }
}
