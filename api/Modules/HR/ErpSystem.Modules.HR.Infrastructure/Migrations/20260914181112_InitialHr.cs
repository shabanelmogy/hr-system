using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialHr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "hr");

            migrationBuilder.CreateTable(
                name: "AttendanceAgents",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    SecretHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SecretPrefix = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LastSeenAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceAgents", x => x.Id);
                    table.UniqueConstraint("AK_AttendanceAgents_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "Branches",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    BranchCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TimeZoneId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    OpenedOn = table.Column<DateOnly>(type: "date", nullable: false),
                    ClosedOn = table.Column<DateOnly>(type: "date", nullable: true),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ManagerId = table.Column<int>(type: "int", nullable: true),
                    IsHeadquarters = table.Column<bool>(type: "bit", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.Id);
                    table.UniqueConstraint("AK_Branches_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "Candidates",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Candidates", x => x.Id);
                    table.UniqueConstraint("AK_Candidates_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "CostCenters",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CostCenterCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ParentCostCenterId = table.Column<int>(type: "int", nullable: true),
                    ManagerId = table.Column<int>(type: "int", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CostCenters", x => x.Id);
                    table.UniqueConstraint("AK_CostCenters_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_CostCenters_CostCenters_TenantId_CompanyId_ParentCostCenterId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ParentCostCenterId },
                        principalSchema: "hr",
                        principalTable: "CostCenters",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EmployeeNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HireDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StatusEffectiveOn = table.Column<DateOnly>(type: "date", nullable: true),
                    StatusReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    TerminationDate = table.Column<DateOnly>(type: "date", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.UniqueConstraint("AK_Employees_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "JobLevels",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LevelCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    LevelOrder = table.Column<int>(type: "int", nullable: false),
                    MinSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    MaxSalary = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    CanManageOthers = table.Column<bool>(type: "bit", nullable: false),
                    IsManagementLevel = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobLevels", x => x.Id);
                    table.UniqueConstraint("AK_JobLevels_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "JobTitles",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    JobTitleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobTitles", x => x.Id);
                    table.UniqueConstraint("AK_JobTitles_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentEvaluationCriteria",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    MaxScore = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    Weight = table.Column<decimal>(type: "decimal(5,2)", precision: 5, scale: 2, nullable: false),
                    IsMandatory = table.Column<bool>(type: "bit", nullable: false),
                    DescriptionAr = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DescriptionEn = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecruitmentEvaluationCriteria", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentEvaluationCriteria_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentPolicies",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    OfferExpiryDays = table.Column<int>(type: "int", nullable: false),
                    AutoPublishOpening = table.Column<bool>(type: "bit", nullable: false),
                    EnforceHeadcountCapacity = table.Column<bool>(type: "bit", nullable: false),
                    DefaultProbationMonths = table.Column<int>(type: "int", nullable: false),
                    EnablePublicPortal = table.Column<bool>(type: "bit", nullable: false),
                    InboundEmailAlias = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecruitmentPolicies", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentPolicies_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentRejectionReasons",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ReasonAr = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    ReasonEn = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SendAutoEmail = table.Column<bool>(type: "bit", nullable: false),
                    EmailSubjectAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmailSubjectEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    EmailBodyAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    EmailBodyEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecruitmentRejectionReasons", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentRejectionReasons_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentSources",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Type = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    ApplicationsCount = table.Column<int>(type: "int", nullable: false),
                    HiredCount = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecruitmentSources", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentSources_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentStages",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    Color = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    FoldedInKanban = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    SendEmailNotification = table.Column<bool>(type: "bit", nullable: false),
                    MappedStatus = table.Column<int>(type: "int", nullable: false),
                    EmailTemplate = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RecruitmentStages", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentStages_TenantId_Id", x => new { x.TenantId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "WorkforcePlans",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PlanSeriesId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    PlanCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    PreviousRevisionId = table.Column<int>(type: "int", nullable: true),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SubmittedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ApprovedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RejectedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RejectedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ActivatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SupersededOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforcePlans", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlans_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "AttendanceDevices",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    NormalizedName = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    ProviderId = table.Column<string>(type: "nvarchar(48)", maxLength: 48, nullable: false),
                    ConnectionMode = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Host = table.Column<string>(type: "nvarchar(253)", maxLength: 253, nullable: false),
                    Port = table.Column<int>(type: "int", nullable: false),
                    TimeZoneId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Enabled = table.Column<bool>(type: "bit", nullable: false),
                    AttendanceAgentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    LastSeenAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastPullAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceDevices", x => x.Id);
                    table.UniqueConstraint("AK_AttendanceDevices_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_AttendanceAgents_TenantId_CompanyId_AttendanceAgentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceAgentId },
                        principalSchema: "hr",
                        principalTable: "AttendanceAgents",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DepartmentCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CostCenterCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ParentDepartmentId = table.Column<int>(type: "int", nullable: true),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    ManagerId = table.Column<int>(type: "int", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.UniqueConstraint("AK_Departments_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Departments_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_TenantId_CompanyId_ParentDepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ParentDepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAssignments",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: true),
                    ReportsToPositionId = table.Column<int>(type: "int", nullable: true),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeAssignments", x => x.Id);
                    table.UniqueConstraint("AK_EmployeeAssignments_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeContracts",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    ContractNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ContractType = table.Column<int>(type: "int", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StatusEffectiveOn = table.Column<DateOnly>(type: "date", nullable: true),
                    StatusReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeContracts", x => x.Id);
                    table.UniqueConstraint("AK_EmployeeContracts_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceBudgets",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_WorkforceBudgets_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceDeviceCredentials",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDeviceId = table.Column<int>(type: "int", nullable: false),
                    ProtectedPayload = table.Column<string>(type: "nvarchar(max)", maxLength: 16000, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceDeviceCredentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalSchema: "hr",
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DevicePullRuns",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDeviceId = table.Column<int>(type: "int", nullable: false),
                    OperationType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    OperationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    FinishedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    FromUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ToUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ReadCount = table.Column<int>(type: "int", nullable: false),
                    InsertedCount = table.Column<int>(type: "int", nullable: false),
                    DuplicateCount = table.Column<int>(type: "int", nullable: false),
                    SkippedCount = table.Column<int>(type: "int", nullable: false),
                    ErrorCount = table.Column<int>(type: "int", nullable: false),
                    SafeError = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ClaimedByAttendanceAgentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    LeaseExpiresAtUtc = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AttemptCount = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DevicePullRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalSchema: "hr",
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RawAttendancePunches",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDeviceId = table.Column<int>(type: "int", nullable: false),
                    ExternalCode = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    OccurredAtDeviceLocal = table.Column<DateTime>(type: "datetime2", nullable: false),
                    OccurredAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    VerifyMode = table.Column<int>(type: "int", nullable: false),
                    InOutMode = table.Column<int>(type: "int", nullable: false),
                    WorkCode = table.Column<int>(type: "int", nullable: false),
                    ProviderEventId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    IdempotencyKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    SafeRawPayload = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PulledAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawAttendancePunches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalSchema: "hr",
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RawDeviceUsers",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDeviceId = table.Column<int>(type: "int", nullable: false),
                    ExternalCode = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    SafeRawPayload = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PulledAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RawDeviceUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalSchema: "hr",
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Divisions",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DivisionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DescriptionEn = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    DescriptionAr = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CostCenterCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    ManagerId = table.Column<int>(type: "int", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Divisions", x => x.Id);
                    table.UniqueConstraint("AK_Divisions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Divisions_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PositionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    JobTitleId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: false),
                    JobLevelId = table.Column<int>(type: "int", nullable: false),
                    TargetHeadcount = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Positions", x => x.Id);
                    table.UniqueConstraint("AK_Positions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Positions_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_JobLevels_TenantId_CompanyId_JobLevelId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobLevelId },
                        principalSchema: "hr",
                        principalTable: "JobLevels",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_JobTitles_TenantId_CompanyId_JobTitleId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobTitleId },
                        principalSchema: "hr",
                        principalTable: "JobTitles",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobDescriptions",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Version = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PurposeEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PurposeAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    ResponsibilitiesEn = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    ResponsibilitiesAr = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    RequirementsEn = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    RequirementsAr = table.Column<string>(type: "nvarchar(max)", maxLength: 8000, nullable: true),
                    PreferredQualificationsEn = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    PreferredQualificationsAr = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RevisionNotes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RequiredSkills = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RequiredEducation = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    MinExperienceYears = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    EffectiveDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ExpiryDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ApprovedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    DecisionOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DutySections = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EducationRequirements = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobDescriptions", x => x.Id);
                    table.UniqueConstraint("AK_JobDescriptions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforcePlanLines",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkforcePlanId = table.Column<int>(type: "int", nullable: false),
                    PositionId = table.Column<int>(type: "int", nullable: false),
                    BranchId = table.Column<int>(type: "int", nullable: true),
                    DepartmentId = table.Column<int>(type: "int", nullable: false),
                    DivisionId = table.Column<int>(type: "int", nullable: false),
                    CurrentHeadcount = table.Column<int>(type: "int", nullable: false),
                    BaselineAsOfDate = table.Column<DateOnly>(type: "date", nullable: false),
                    NewHireSlots = table.Column<int>(type: "int", nullable: false),
                    ReplacementSlots = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforcePlanLines", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlanLines_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceBudgetLines",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_WorkforceBudgetLines_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_WorkforceBudgets_TenantId_CompanyId_WorkforceBudgetId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetId },
                        principalSchema: "hr",
                        principalTable: "WorkforceBudgets",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforceBudgetLines_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforcePlanLinePeriodTargets",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkforcePlanLineId = table.Column<int>(type: "int", nullable: false),
                    FiscalPeriodId = table.Column<int>(type: "int", nullable: false),
                    NewHireSlots = table.Column<int>(type: "int", nullable: false),
                    ReplacementSlots = table.Column<int>(type: "int", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkforcePlanLinePeriodTargets", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlanLinePeriodTargets_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PositionEnvelopes",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_PositionEnvelopes_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetLineId },
                        principalSchema: "hr",
                        principalTable: "WorkforceBudgetLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforceBudgets_TenantId_CompanyId_WorkforceBudgetId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetId },
                        principalSchema: "hr",
                        principalTable: "WorkforceBudgets",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PositionEnvelopes_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalSchema: "hr",
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforceBudgetPeriodAllocations",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_WorkforceBudgetPeriodAllocations_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforceBudgetLineId },
                        principalSchema: "hr",
                        principalTable: "WorkforceBudgetLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EnvelopeAmendments",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnvelopeId = table.Column<int>(type: "int", nullable: false),
                    AdditionalHeadcount = table.Column<int>(type: "int", nullable: false),
                    AdditionalSalaryCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RequestedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SubmittedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ApprovedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    RejectedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RejectedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EnvelopeAmendments", x => x.Id);
                    table.UniqueConstraint("AK_EnvelopeAmendments_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EnvelopeAmendments_PositionEnvelopes_TenantId_CompanyId_EnvelopeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EnvelopeId },
                        principalSchema: "hr",
                        principalTable: "PositionEnvelopes",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StaffingRequests",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EnvelopeId = table.Column<int>(type: "int", nullable: false),
                    RequestedHeadcount = table.Column<int>(type: "int", nullable: false),
                    EstimatedAnnualSalaryPerSlot = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    EstimatedFiscalYearCostPerSlot = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalReservedCost = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TargetStartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    RequestType = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Justification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    CalculationPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    AllocatedRequisitionPositions = table.Column<int>(type: "int", nullable: false),
                    HiredPositions = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    CloseReason = table.Column<int>(type: "int", nullable: true),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    SubmittedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ApprovedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    RejectedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RejectedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    ClosedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StaffingRequests", x => x.Id);
                    table.UniqueConstraint("AK_StaffingRequests_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_StaffingRequests_PositionEnvelopes_TenantId_CompanyId_EnvelopeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EnvelopeId },
                        principalSchema: "hr",
                        principalTable: "PositionEnvelopes",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobRequisitions",
                schema: "hr",
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
                    StaffingRequestId = table.Column<int>(type: "int", nullable: true),
                    PlanningSource = table.Column<int>(type: "int", nullable: false, defaultValue: 2),
                    HiredPositions = table.Column<int>(type: "int", nullable: false),
                    BusinessReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    EmploymentType = table.Column<int>(type: "int", nullable: false),
                    WorkArrangement = table.Column<int>(type: "int", nullable: false),
                    TargetHireDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Type = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    ReplacementEmployeeId = table.Column<int>(type: "int", nullable: true),
                    IsBudgeted = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    BudgetJustification = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    SubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ReviewedByEmployeeId = table.Column<int>(type: "int", nullable: true),
                    ReviewedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    DecisionReason = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_JobRequisitions_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Employees_TenantId_CompanyId_ReplacementEmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ReplacementEmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobRequisitions_StaffingRequests_TenantId_CompanyId_StaffingRequestId",
                        columns: x => new { x.TenantId, x.CompanyId, x.StaffingRequestId },
                        principalSchema: "hr",
                        principalTable: "StaffingRequests",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobOpenings",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_JobOpenings_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_JobRequisitions_TenantId_CompanyId_JobRequisitionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobRequisitionId },
                        principalSchema: "hr",
                        principalTable: "JobRequisitions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOpenings_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobPostings",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_JobPostings_JobOpenings_TenantId_CompanyId_JobOpeningId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOpeningId },
                        principalSchema: "hr",
                        principalTable: "JobOpenings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmploymentApplications",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PublicId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CandidateId = table.Column<int>(type: "int", nullable: false),
                    JobOpeningId = table.Column<int>(type: "int", nullable: false),
                    JobPostingId = table.Column<int>(type: "int", nullable: true),
                    EmployeeId = table.Column<int>(type: "int", nullable: true),
                    HireIdempotencyKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_EmploymentApplications_Candidates_TenantId_CandidateId",
                        columns: x => new { x.TenantId, x.CandidateId },
                        principalSchema: "hr",
                        principalTable: "Candidates",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_JobOpenings_TenantId_CompanyId_JobOpeningId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOpeningId },
                        principalSchema: "hr",
                        principalTable: "JobOpenings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentApplications_JobPostings_TenantId_CompanyId_JobPostingId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobPostingId },
                        principalSchema: "hr",
                        principalTable: "JobPostings",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationStatusHistories",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_ApplicationStatusHistories_EmploymentApplications_EmploymentApplicationId",
                        column: x => x.EmploymentApplicationId,
                        principalSchema: "hr",
                        principalTable: "EmploymentApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Interviews",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_Interviews_EmploymentApplications_TenantId_CompanyId_EmploymentApplicationId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId },
                        principalSchema: "hr",
                        principalTable: "EmploymentApplications",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobOffers",
                schema: "hr",
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
                    AnnualSalarySnapshot = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    FiscalYearCostSnapshot = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    ReservationDelta = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    CalculationPolicyVersion = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ApprovalSubmittedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovalSubmittedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ApprovedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    ApprovedById = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    ApprovalDecisionReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_JobOffers_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalSchema: "hr",
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalSchema: "hr",
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalSchema: "hr",
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_EmploymentApplications_TenantId_CompanyId_EmploymentApplicationId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmploymentApplicationId },
                        principalSchema: "hr",
                        principalTable: "EmploymentApplications",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobOffers_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalSchema: "hr",
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewEvaluations",
                schema: "hr",
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
                    SkillEvaluationsJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_InterviewEvaluations_Employees_TenantId_CompanyId_InterviewerEmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.InterviewerEmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewEvaluations_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalSchema: "hr",
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "InterviewParticipants",
                schema: "hr",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InterviewId = table.Column<int>(type: "int", nullable: false),
                    EmployeeId = table.Column<int>(type: "int", nullable: false),
                    IsLead = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_InterviewParticipants_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalSchema: "hr",
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_InterviewParticipants_Interviews_InterviewId",
                        column: x => x.InterviewId,
                        principalSchema: "hr",
                        principalTable: "Interviews",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobOfferApprovalHistory",
                schema: "hr",
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
                    CreatedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByPc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DeletedById = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_JobOfferApprovalHistory_JobOffers_TenantId_CompanyId_JobOfferId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobOfferId },
                        principalSchema: "hr",
                        principalTable: "JobOffers",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_EmploymentApplicationId",
                schema: "hr",
                table: "ApplicationStatusHistories",
                column: "EmploymentApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId",
                schema: "hr",
                table: "ApplicationStatusHistories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId_CompanyId",
                schema: "hr",
                table: "ApplicationStatusHistories",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_TenantId_CompanyId_EmploymentApplicationId",
                schema: "hr",
                table: "ApplicationStatusHistories",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_SecretHash",
                schema: "hr",
                table: "AttendanceAgents",
                column: "SecretHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId",
                schema: "hr",
                table: "AttendanceAgents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId",
                schema: "hr",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId_NormalizedName",
                schema: "hr",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId",
                schema: "hr",
                table: "AttendanceDeviceCredentials",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId_CompanyId",
                schema: "hr",
                table: "AttendanceDeviceCredentials",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId_CompanyId_AttendanceDeviceId",
                schema: "hr",
                table: "AttendanceDeviceCredentials",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId",
                schema: "hr",
                table: "AttendanceDevices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId",
                schema: "hr",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_AttendanceAgentId",
                schema: "hr",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "AttendanceAgentId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_Enabled",
                schema: "hr",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "Enabled" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_NormalizedName",
                schema: "hr",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId",
                schema: "hr",
                table: "Branches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId",
                schema: "hr",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_BranchCode",
                schema: "hr",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "BranchCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_NameAr",
                schema: "hr",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_NameEn",
                schema: "hr",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId",
                schema: "hr",
                table: "Candidates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_Email",
                schema: "hr",
                table: "Candidates",
                columns: new[] { "TenantId", "Email" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_PhoneNumber",
                schema: "hr",
                table: "Candidates",
                columns: new[] { "TenantId", "PhoneNumber" });

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_TenantId_PortalUserId",
                schema: "hr",
                table: "Candidates",
                columns: new[] { "TenantId", "PortalUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId",
                schema: "hr",
                table: "CostCenters",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId",
                schema: "hr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_CostCenterCode",
                schema: "hr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "CostCenterCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_NameAr",
                schema: "hr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "NameAr" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_NameEn",
                schema: "hr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "NameEn" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_ParentCostCenterId",
                schema: "hr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "ParentCostCenterId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId",
                schema: "hr",
                table: "Departments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameAr",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameAr" },
                unique: true,
                filter: "[BranchId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_BranchId_NameEn",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "NameEn" },
                unique: true,
                filter: "[BranchId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_DepartmentCode",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "DepartmentCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_NameAr",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true,
                filter: "[BranchId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_NameEn",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true,
                filter: "[BranchId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId_ParentDepartmentId",
                schema: "hr",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "ParentDepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId",
                schema: "hr",
                table: "DevicePullRuns",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId",
                schema: "hr",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_AttendanceDeviceId_OperationId",
                schema: "hr",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "OperationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_ClaimedByAttendanceAgentId_LeaseExpiresAtUtc",
                schema: "hr",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "ClaimedByAttendanceAgentId", "LeaseExpiresAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_Status_StartedAtUtc",
                schema: "hr",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "Status", "StartedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId",
                schema: "hr",
                table: "Divisions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId",
                schema: "hr",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameAr",
                schema: "hr",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DepartmentId_NameEn",
                schema: "hr",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId_DivisionCode",
                schema: "hr",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DivisionCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId",
                schema: "hr",
                table: "EmployeeAssignments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId",
                schema: "hr",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_EmployeeId",
                schema: "hr",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId",
                schema: "hr",
                table: "EmployeeContracts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId",
                schema: "hr",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId_ContractNumber",
                schema: "hr",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId", "ContractNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId_EmployeeId",
                schema: "hr",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId",
                schema: "hr",
                table: "Employees",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CandidateId",
                schema: "hr",
                table: "Employees",
                columns: new[] { "TenantId", "CandidateId" },
                filter: "[CandidateId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId",
                schema: "hr",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId_EmployeeNumber",
                schema: "hr",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId", "EmployeeNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId_UserId",
                schema: "hr",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId",
                schema: "hr",
                table: "EmploymentApplications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CandidateId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CandidateId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_CandidateId_JobOpeningId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "CandidateId", "JobOpeningId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3, 4, 5, 6, 7, 8, 9)");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_EmployeeId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_HireIdempotencyKey",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "HireIdempotencyKey" },
                unique: true,
                filter: "[HireIdempotencyKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_JobOpeningId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "JobOpeningId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_JobPostingId",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "JobPostingId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentApplications_TenantId_CompanyId_Status",
                schema: "hr",
                table: "EmploymentApplications",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_EnvelopeAmendments_TenantId",
                schema: "hr",
                table: "EnvelopeAmendments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EnvelopeAmendments_TenantId_CompanyId",
                schema: "hr",
                table: "EnvelopeAmendments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EnvelopeAmendments_TenantId_CompanyId_EnvelopeId",
                schema: "hr",
                table: "EnvelopeAmendments",
                columns: new[] { "TenantId", "CompanyId", "EnvelopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_EnvelopeAmendments_TenantId_CompanyId_Status",
                schema: "hr",
                table: "EnvelopeAmendments",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_InterviewId_InterviewerEmployeeId",
                schema: "hr",
                table: "InterviewEvaluations",
                columns: new[] { "InterviewId", "InterviewerEmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId",
                schema: "hr",
                table: "InterviewEvaluations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId_CompanyId",
                schema: "hr",
                table: "InterviewEvaluations",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId_CompanyId_InterviewerEmployeeId",
                schema: "hr",
                table: "InterviewEvaluations",
                columns: new[] { "TenantId", "CompanyId", "InterviewerEmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewEvaluations_TenantId_CompanyId_InterviewId",
                schema: "hr",
                table: "InterviewEvaluations",
                columns: new[] { "TenantId", "CompanyId", "InterviewId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_InterviewId_EmployeeId",
                schema: "hr",
                table: "InterviewParticipants",
                columns: new[] { "InterviewId", "EmployeeId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId",
                schema: "hr",
                table: "InterviewParticipants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId_CompanyId",
                schema: "hr",
                table: "InterviewParticipants",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId_CompanyId_EmployeeId",
                schema: "hr",
                table: "InterviewParticipants",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_InterviewParticipants_TenantId_CompanyId_InterviewId",
                schema: "hr",
                table: "InterviewParticipants",
                columns: new[] { "TenantId", "CompanyId", "InterviewId" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId",
                schema: "hr",
                table: "Interviews",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId",
                schema: "hr",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_EmploymentApplicationId",
                schema: "hr",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_StartsOn",
                schema: "hr",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "StartsOn" });

            migrationBuilder.CreateIndex(
                name: "IX_Interviews_TenantId_CompanyId_Status",
                schema: "hr",
                table: "Interviews",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId",
                schema: "hr",
                table: "JobDescriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId",
                schema: "hr",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleAr",
                schema: "hr",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "TitleAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_TitleEn",
                schema: "hr",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "TitleEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_Version",
                schema: "hr",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId",
                schema: "hr",
                table: "JobLevels",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId",
                schema: "hr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_LevelCode",
                schema: "hr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "LevelCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_LevelOrder",
                schema: "hr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "LevelOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameAr",
                schema: "hr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_NameEn",
                schema: "hr",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId",
                schema: "hr",
                table: "JobOfferApprovalHistory",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId_CompanyId",
                schema: "hr",
                table: "JobOfferApprovalHistory",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOfferApprovalHistory_TenantId_CompanyId_JobOfferId_OccurredOn",
                schema: "hr",
                table: "JobOfferApprovalHistory",
                columns: new[] { "TenantId", "CompanyId", "JobOfferId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId",
                schema: "hr",
                table: "JobOffers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_EmploymentApplicationId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3, 7, 8)");

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_OfferNumber",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "OfferNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOffers_TenantId_CompanyId_Status",
                schema: "hr",
                table: "JobOffers",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId",
                schema: "hr",
                table: "JobOpenings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_JobRequisitionId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "JobRequisitionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_OpeningNumber",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "OpeningNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobOpenings_TenantId_CompanyId_Status",
                schema: "hr",
                table: "JobOpenings",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId",
                schema: "hr",
                table: "JobPostings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId",
                schema: "hr",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_JobOpeningId",
                schema: "hr",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "JobOpeningId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_Slug",
                schema: "hr",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "Slug" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobPostings_TenantId_CompanyId_Status",
                schema: "hr",
                table: "JobPostings",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId",
                schema: "hr",
                table: "JobRequisitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_ReplacementEmployeeId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "ReplacementEmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_RequisitionNumber",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "RequisitionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_StaffingRequestId",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "StaffingRequestId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobRequisitions_TenantId_CompanyId_Status",
                schema: "hr",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId",
                schema: "hr",
                table: "JobTitles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId",
                schema: "hr",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_JobTitleCode",
                schema: "hr",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "JobTitleCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleAr",
                schema: "hr",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "TitleAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_TitleEn",
                schema: "hr",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "TitleEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId",
                schema: "hr",
                table: "PositionEnvelopes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_EnvelopeCode",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "EnvelopeCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforceBudgetId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforceBudgetLineId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetLineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforcePlanId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId" });

            migrationBuilder.CreateIndex(
                name: "IX_PositionEnvelopes_TenantId_CompanyId_WorkforcePlanLineId",
                schema: "hr",
                table: "PositionEnvelopes",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId",
                schema: "hr",
                table: "Positions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId",
                schema: "hr",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_JobLevelId",
                schema: "hr",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "JobLevelId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_JobTitleId",
                schema: "hr",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "JobTitleId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_PositionCode",
                schema: "hr",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "PositionCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId",
                schema: "hr",
                table: "RawAttendancePunches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId",
                schema: "hr",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId_AttendanceDeviceId_IdempotencyKey",
                schema: "hr",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId_AttendanceDeviceId_OccurredAtUtc",
                schema: "hr",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId",
                schema: "hr",
                table: "RawDeviceUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId_CompanyId",
                schema: "hr",
                table: "RawDeviceUsers",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId_CompanyId_AttendanceDeviceId_ExternalCode",
                schema: "hr",
                table: "RawDeviceUsers",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "ExternalCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_TenantId",
                schema: "hr",
                table: "RecruitmentEvaluationCriteria",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_TenantId_Code",
                schema: "hr",
                table: "RecruitmentEvaluationCriteria",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentPolicies_TenantId",
                schema: "hr",
                table: "RecruitmentPolicies",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId",
                schema: "hr",
                table: "RecruitmentRejectionReasons",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId_Category",
                schema: "hr",
                table: "RecruitmentRejectionReasons",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId_Code",
                schema: "hr",
                table: "RecruitmentRejectionReasons",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_TenantId",
                schema: "hr",
                table: "RecruitmentSources",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_TenantId_Code",
                schema: "hr",
                table: "RecruitmentSources",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId",
                schema: "hr",
                table: "RecruitmentStages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId_Code",
                schema: "hr",
                table: "RecruitmentStages",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId_Sequence",
                schema: "hr",
                table: "RecruitmentStages",
                columns: new[] { "TenantId", "Sequence" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffingRequests_TenantId",
                schema: "hr",
                table: "StaffingRequests",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_StaffingRequests_TenantId_CompanyId",
                schema: "hr",
                table: "StaffingRequests",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffingRequests_TenantId_CompanyId_EnvelopeId",
                schema: "hr",
                table: "StaffingRequests",
                columns: new[] { "TenantId", "CompanyId", "EnvelopeId" });

            migrationBuilder.CreateIndex(
                name: "IX_StaffingRequests_TenantId_CompanyId_Status",
                schema: "hr",
                table: "StaffingRequests",
                columns: new[] { "TenantId", "CompanyId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_WorkforceBudgetId_WorkforcePlanLineId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetId", "WorkforcePlanLineId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetLines_TenantId_CompanyId_WorkforcePlanLineId",
                schema: "hr",
                table: "WorkforceBudgetLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId",
                schema: "hr",
                table: "WorkforceBudgetPeriodAllocations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforceBudgetPeriodAllocations",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgetPeriodAllocations_TenantId_CompanyId_WorkforceBudgetLineId_FiscalPeriodId",
                schema: "hr",
                table: "WorkforceBudgetPeriodAllocations",
                columns: new[] { "TenantId", "CompanyId", "WorkforceBudgetLineId", "FiscalPeriodId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId",
                schema: "hr",
                table: "WorkforceBudgets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId_FiscalYearId_BudgetCode",
                schema: "hr",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "BudgetCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforceBudgets_TenantId_CompanyId_WorkforcePlanId",
                schema: "hr",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_WorkforceBudgets_OneEffectivePerFiscalYear",
                schema: "hr",
                table: "WorkforceBudgets",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId" },
                unique: true,
                filter: "[Status] = 3 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId",
                schema: "hr",
                table: "WorkforcePlanLinePeriodTargets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforcePlanLinePeriodTargets",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId_CompanyId_WorkforcePlanLineId_FiscalPeriodId",
                schema: "hr",
                table: "WorkforcePlanLinePeriodTargets",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId", "FiscalPeriodId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId",
                schema: "hr",
                table: "WorkforcePlanLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_BranchId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_DepartmentId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_DivisionId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_PositionId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanId_PositionId",
                schema: "hr",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId",
                schema: "hr",
                table: "WorkforcePlans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId_CompanyId",
                schema: "hr",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId_CompanyId_FiscalYearId_PlanCode_RevisionNumber",
                schema: "hr",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "PlanCode", "RevisionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "UX_WorkforcePlans_OneEffectivePerFiscalYear",
                schema: "hr",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId" },
                unique: true,
                filter: "[Status] = 4 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "AttendanceDeviceCredentials",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "CostCenters",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "DevicePullRuns",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmployeeAssignments",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmployeeContracts",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EnvelopeAmendments",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "InterviewEvaluations",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "InterviewParticipants",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobDescriptions",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobOfferApprovalHistory",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RawAttendancePunches",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RawDeviceUsers",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RecruitmentEvaluationCriteria",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RecruitmentPolicies",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RecruitmentRejectionReasons",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RecruitmentSources",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "RecruitmentStages",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforceBudgetPeriodAllocations",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforcePlanLinePeriodTargets",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Interviews",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobOffers",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "AttendanceDevices",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "EmploymentApplications",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "AttendanceAgents",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Candidates",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobPostings",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobOpenings",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobRequisitions",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Employees",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "StaffingRequests",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "PositionEnvelopes",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforceBudgetLines",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforceBudgets",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforcePlanLines",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Positions",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "WorkforcePlans",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Divisions",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobLevels",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "JobTitles",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Departments",
                schema: "hr");

            migrationBuilder.DropTable(
                name: "Branches",
                schema: "hr");
        }
    }
}
