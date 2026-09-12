using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.HR.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SecurityAuditEvents",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    CompanyId = table.Column<int>(type: "int", nullable: true),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Action = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TargetId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    Outcome = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    IpAddress = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    UserAgent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    CorrelationId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    MetadataJson = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    OccurredOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecurityAuditEvents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Identifier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    LifecycleStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "Active"),
                    ArchivedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ArchiveReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    PurgeScheduledOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubscriptionStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SubscriptionStartedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SubscriptionEndsOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PlanName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    MaxAdmins = table.Column<int>(type: "int", nullable: false),
                    MaxUsers = table.Column<int>(type: "int", nullable: false),
                    BillingEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    ContactPhone = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    UpdatedOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    IsSystem = table.Column<bool>(type: "bit", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                    table.CheckConstraint("CK_AspNetRoles_SystemTenantConsistency", "([IsSystem] = 1 AND [TenantId] IS NULL AND [NormalizedName] IN ('SUPER_ADMIN', 'ADMIN', 'USER')) OR ([IsSystem] = 0 AND [TenantId] IS NOT NULL AND ([NormalizedName] IS NULL OR [NormalizedName] NOT IN ('SUPER_ADMIN', 'ADMIN', 'USER')))");
                    table.ForeignKey(
                        name: "FK_AspNetRoles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsDisabled = table.Column<bool>(type: "bit", nullable: false),
                    LifecycleStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false, defaultValue: "Active"),
                    ArchivedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ArchiveReason = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    ProfilePicture = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUsers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AuthenticationSelectionChallenges",
                columns: table => new
                {
                    JwtId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Scope = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: true),
                    ExpiresOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthenticationSelectionChallenges", x => x.JwtId);
                    table.ForeignKey(
                        name: "FK_AuthenticationSelectionChallenges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Alpha2Code = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: true),
                    Alpha3Code = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
                    PhoneCode = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: true),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Countries_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Countries_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Countries_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentEvaluationCriteria",
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
                    table.PrimaryKey("PK_RecruitmentEvaluationCriteria", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentEvaluationCriteria_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_RecruitmentEvaluationCriteria_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecruitmentEvaluationCriteria_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentEvaluationCriteria_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentEvaluationCriteria_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentPolicies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DefaultCurrency = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    OfferExpiryDays = table.Column<int>(type: "int", nullable: false),
                    AutoPublishOpening = table.Column<bool>(type: "bit", nullable: false),
                    EnforceHeadcountCapacity = table.Column<bool>(type: "bit", nullable: false),
                    DefaultProbationMonths = table.Column<int>(type: "int", nullable: false),
                    EnablePublicPortal = table.Column<bool>(type: "bit", nullable: false),
                    InboundEmailAlias = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_RecruitmentPolicies", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentPolicies_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_RecruitmentPolicies_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecruitmentPolicies_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentPolicies_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentPolicies_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentRejectionReasons",
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
                    table.PrimaryKey("PK_RecruitmentRejectionReasons", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentRejectionReasons_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_RecruitmentRejectionReasons_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecruitmentRejectionReasons_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentRejectionReasons_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentRejectionReasons_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentSources",
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
                    table.PrimaryKey("PK_RecruitmentSources", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentSources_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_RecruitmentSources_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecruitmentSources_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentSources_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentSources_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RecruitmentStages",
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
                    table.PrimaryKey("PK_RecruitmentStages", x => x.Id);
                    table.UniqueConstraint("AK_RecruitmentStages_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_RecruitmentStages_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RecruitmentStages_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentStages_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RecruitmentStages_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RefreshToken",
                columns: table => new
                {
                    ApplicationUserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    SessionId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    JwtId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RevokedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevocationReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedByIp = table.Column<string>(type: "nvarchar(45)", maxLength: 45, nullable: true),
                    CreatedByUserAgent = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshToken", x => new { x.ApplicationUserId, x.Id });
                    table.ForeignKey(
                        name: "FK_RefreshToken_AspNetUsers_ApplicationUserId",
                        column: x => x.ApplicationUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportsCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportsCategories", x => x.Id);
                    table.CheckConstraint("CHK_ReportCategory_Name_EnglishWithSpaces", "[Name] NOT LIKE '%[^A-Za-z ]%'");
                    table.ForeignKey(
                        name: "FK_ReportsCategories_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportsCategories_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportsCategories_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ReportTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FeatureKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataSourceKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DefinitionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentHash = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_ReportTemplates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplates_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportTemplates_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportTemplates_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportTemplates_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserInvitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    FirstName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    LastName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TokenHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    RolesJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    CompanyIdsJson = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    DefaultCompanyId = table.Column<int>(type: "int", nullable: false),
                    InvitedByUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AcceptedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserInvitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserInvitations_AspNetUsers_InvitedByUserId",
                        column: x => x.InvitedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserInvitations_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserTenantAccesses",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserTenantAccesses", x => new { x.UserId, x.TenantId });
                    table.ForeignKey(
                        name: "FK_UserTenantAccesses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserTenantAccesses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    RegistrationNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    TaxNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RegistrationCountryId = table.Column<int>(type: "int", nullable: true),
                    ParentCompanyId = table.Column<int>(type: "int", nullable: true),
                    DefaultCurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    TimeZoneId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Background = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_Companies", x => x.Id);
                    table.UniqueConstraint("AK_Companies_TenantId_Id", x => new { x.TenantId, x.Id });
                    table.ForeignKey(
                        name: "FK_Companies_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Companies_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Companies_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Companies_Companies_ParentCompanyId",
                        column: x => x.ParentCompanyId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Companies_Countries_RegistrationCountryId",
                        column: x => x.RegistrationCountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Companies_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "States",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    CountryId = table.Column<int>(type: "int", nullable: false),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_States", x => x.Id);
                    table.ForeignKey(
                        name: "FK_States_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_States_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_States_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_States_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportsMasters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReportName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExportedName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReportPath = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Logo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ViewName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReportCategoryId = table.Column<int>(type: "int", nullable: false),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportsMasters", x => x.Id);
                    table.CheckConstraint("CHK_ReportMaster_ExportedName_EnglishOnly", "[ExportedName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_Logo_EnglishOnly", "[Logo] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ReportName_EnglishOnly", "[ReportName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ReportPath_EnglishOnly", "[ReportPath] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportMaster_ViewName_EnglishOnly", "[ViewName] NOT LIKE '%[^A-Za-z ]%'");
                    table.ForeignKey(
                        name: "FK_ReportsMasters_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportsMasters_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportsMasters_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportsMasters_ReportsCategories_ReportCategoryId",
                        column: x => x.ReportCategoryId,
                        principalTable: "ReportsCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportTemplateRevisions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ReportTemplateId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RevisionNumber = table.Column<int>(type: "int", nullable: false),
                    Operation = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataSourceKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    DefinitionJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentHash = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    IsPublished = table.Column<bool>(type: "bit", nullable: false),
                    IsArchived = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_ReportTemplateRevisions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_ReportTemplates_ReportTemplateId",
                        column: x => x.ReportTemplateId,
                        principalTable: "ReportTemplates",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportTemplateRevisions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AddressTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_AddressTypes", x => x.Id);
                    table.UniqueConstraint("AK_AddressTypes_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AddressTypes_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AddressTypes_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AddressTypes_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AddressTypes_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AddressTypes_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApiKeys",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    KeyHash = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    KeyPrefix = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    ClientUri = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevokedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RevocationReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApiKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApiKeys_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApiKeys_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Start = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    End = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsAllDay = table.Column<bool>(type: "bit", nullable: false),
                    Text = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
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
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Appointments_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Appointments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceAgents",
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
                    table.PrimaryKey("PK_AttendanceAgents", x => x.Id);
                    table.UniqueConstraint("AK_AttendanceAgents_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceAgents_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Branches",
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
                    table.PrimaryKey("PK_Branches", x => x.Id);
                    table.UniqueConstraint("AK_Branches_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Branches_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Branches_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Branches_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Branches_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Branches_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_Categories", x => x.Id);
                    table.CheckConstraint("CHK_Category_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");
                    table.CheckConstraint("CHK_Category_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'");
                    table.ForeignKey(
                        name: "FK_Categories_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Categories_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Categories_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Categories_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Categories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyCountries",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_CompanyCountries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyCountries_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyCountries_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CostCenters",
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
                    table.PrimaryKey("PK_CostCenters", x => x.Id);
                    table.UniqueConstraint("AK_CostCenters_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_CostCenters_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CostCenters_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CostCenters_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CostCenters_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CostCenters_CostCenters_TenantId_CompanyId_ParentCostCenterId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ParentCostCenterId },
                        principalTable: "CostCenters",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CostCenters_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Currencies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    ExchangeRateToDefault = table.Column<decimal>(type: "decimal(18,6)", precision: 18, scale: 6, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                    table.UniqueConstraint("AK_Currencies_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Currencies_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Currencies_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Currencies_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Currencies_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Currencies_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
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
                    table.PrimaryKey("PK_Employees", x => x.Id);
                    table.UniqueConstraint("AK_Employees_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Employees_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Employees_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EntityChangeLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    EntityId = table.Column<int>(type: "int", nullable: false),
                    EntityKey = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    EntityName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    JsonOldValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    JsonNewValues = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ChangedById = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedByPc = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EntityChangeLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EntityChangeLogs_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EntityChangeLogs_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Files",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    StoredFileName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    FileExtension = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
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
                    table.PrimaryKey("PK_Files", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Files_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Files_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Files_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Files_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Files_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FiscalYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodFrequency = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalYears", x => x.Id);
                    table.UniqueConstraint("AK_FiscalYears_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalYears_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalYears_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalYears_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobLevels",
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
                    table.PrimaryKey("PK_JobLevels", x => x.Id);
                    table.UniqueConstraint("AK_JobLevels_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobLevels_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobLevels_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobLevels_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobLevels_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobLevels_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobTitles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TitleEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TitleAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    JobTitleCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
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
                    table.PrimaryKey("PK_JobTitles", x => x.Id);
                    table.UniqueConstraint("AK_JobTitles_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JobTitles_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobTitles_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobTitles_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobTitles_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobTitles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoginAudits",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    LoginDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LogOutDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginAudits", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LoginAudits_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_LoginAudits_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LoginAudits_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    RecipientUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    ActorUserId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    RequiredPermission = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EventType = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    TitleKey = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MessageKey = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ParametersJson = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    EntityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    EntityId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ActionUrl = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CorrelationId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeduplicationKey = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ReadOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DismissedOn = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresOn = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_ActorUserId",
                        column: x => x.ActorUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_RecipientUserId",
                        column: x => x.RecipientUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Notifications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SubCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
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
                    table.PrimaryKey("PK_SubCategories", x => x.Id);
                    table.CheckConstraint("CHK_SubCategory_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");
                    table.CheckConstraint("CHK_SubCategory_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'");
                    table.ForeignKey(
                        name: "FK_SubCategories_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubCategories_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SubCategories_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_SubCategories_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SubCategories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserCompanyAccesses",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserCompanyAccesses", x => new { x.UserId, x.CompanyId });
                    table.ForeignKey(
                        name: "FK_UserCompanyAccesses_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCompanyAccesses_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserCompanyAccesses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

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
                name: "Districts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: false),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Districts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Districts_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Districts_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Districts_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Districts_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ReportsDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PropertyName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ColumnName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ReportMasterId = table.Column<int>(type: "int", nullable: false),
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
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportsDetails", x => x.Id);
                    table.CheckConstraint("CHK_ReportDetail_ColumnName_EnglishOnly", "[ColumnName] NOT LIKE '%[^A-Za-z ]%'");
                    table.CheckConstraint("CHK_ReportDetail_PropertyName_EnglishOnly", "[PropertyName] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");
                    table.ForeignKey(
                        name: "FK_ReportsDetails_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ReportsDetails_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportsDetails_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportsDetails_ReportsMasters_ReportMasterId",
                        column: x => x.ReportMasterId,
                        principalTable: "ReportsMasters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceDevices",
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
                    table.PrimaryKey("PK_AttendanceDevices", x => x.Id);
                    table.UniqueConstraint("AK_AttendanceDevices_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_AttendanceAgents_TenantId_CompanyId_AttendanceAgentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceAgentId },
                        principalTable: "AttendanceAgents",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDevices_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
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
                    table.PrimaryKey("PK_Departments", x => x.Id);
                    table.UniqueConstraint("AK_Departments_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Departments_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Departments_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Departments_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Departments_TenantId_CompanyId_ParentDepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ParentDepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Departments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAssignments",
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
                    table.PrimaryKey("PK_EmployeeAssignments", x => x.Id);
                    table.UniqueConstraint("AK_EmployeeAssignments_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeAssignments_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeContracts",
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
                    table.PrimaryKey("PK_EmployeeContracts", x => x.Id);
                    table.UniqueConstraint("AK_EmployeeContracts_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_Employees_TenantId_CompanyId_EmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.EmployeeId },
                        principalTable: "Employees",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeContracts_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FiscalPeriods",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(24)", maxLength: 24, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalPeriods", x => x.Id);
                    table.UniqueConstraint("AK_FiscalPeriods_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkforcePlans",
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
                    table.PrimaryKey("PK_WorkforcePlans", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlans_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlans_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CategorySubcategories",
                columns: table => new
                {
                    CategoryId = table.Column<int>(type: "int", nullable: false),
                    SubCategoryId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategorySubcategories", x => new { x.CategoryId, x.SubCategoryId });
                    table.ForeignKey(
                        name: "FK_CategorySubcategories_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CategorySubcategories_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CategorySubcategories_SubCategories_SubCategoryId",
                        column: x => x.SubCategoryId,
                        principalTable: "SubCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CategorySubcategories_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CountryId = table.Column<int>(type: "int", nullable: false),
                    StateId = table.Column<int>(type: "int", nullable: true),
                    DistrictId = table.Column<int>(type: "int", nullable: true),
                    City = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    StreetLine1 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    StreetLine2 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    BuildingNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Floor = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    ApartmentNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Latitude = table.Column<double>(type: "float(18)", precision: 18, scale: 6, nullable: true),
                    Longitude = table.Column<double>(type: "float(18)", precision: 18, scale: 6, nullable: true),
                    AddressTypeId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                    table.UniqueConstraint("AK_Addresses_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.CheckConstraint("CHK_Address_Coordinates_Paired", "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL)");
                    table.CheckConstraint("CHK_Address_Latitude_Range", "[Latitude] IS NULL OR ([Latitude] >= -90 AND [Latitude] <= 90)");
                    table.CheckConstraint("CHK_Address_Longitude_Range", "[Longitude] IS NULL OR ([Longitude] >= -180 AND [Longitude] <= 180)");
                    table.ForeignKey(
                        name: "FK_Addresses_AddressTypes_TenantId_CompanyId_AddressTypeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AddressTypeId },
                        principalTable: "AddressTypes",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Addresses_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Addresses_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_Countries_CountryId",
                        column: x => x.CountryId,
                        principalTable: "Countries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_Districts_DistrictId",
                        column: x => x.DistrictId,
                        principalTable: "Districts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_States_StateId",
                        column: x => x.StateId,
                        principalTable: "States",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Addresses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceDeviceCredentials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttendanceDeviceId = table.Column<int>(type: "int", nullable: false),
                    ProtectedPayload = table.Column<string>(type: "nvarchar(max)", maxLength: 16000, nullable: false),
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
                    table.PrimaryKey("PK_AttendanceDeviceCredentials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceDeviceCredentials_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DevicePullRuns",
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
                    table.PrimaryKey("PK_DevicePullRuns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DevicePullRuns_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RawAttendancePunches",
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
                    table.PrimaryKey("PK_RawAttendancePunches", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawAttendancePunches_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RawDeviceUsers",
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
                    table.PrimaryKey("PK_RawDeviceUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_AttendanceDevices_TenantId_CompanyId_AttendanceDeviceId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AttendanceDeviceId },
                        principalTable: "AttendanceDevices",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RawDeviceUsers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Divisions",
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
                    table.PrimaryKey("PK_Divisions", x => x.Id);
                    table.UniqueConstraint("AK_Divisions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Divisions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Divisions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Divisions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Divisions_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Divisions_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Divisions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BranchAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BranchId = table.Column<int>(type: "int", nullable: false),
                    AddressId = table.Column<int>(type: "int", nullable: false),
                    Purpose = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_BranchAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BranchAddresses_Addresses_TenantId_CompanyId_AddressId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AddressId },
                        principalTable: "Addresses",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BranchAddresses_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BranchAddresses_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BranchAddresses_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_BranchAddresses_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BranchAddresses_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BranchAddresses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CompanyAddresses",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AddressId = table.Column<int>(type: "int", nullable: false),
                    Purpose = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_CompanyAddresses", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_Addresses_TenantId_CompanyId_AddressId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AddressId },
                        principalTable: "Addresses",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CompanyAddresses_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Positions",
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
                    table.PrimaryKey("PK_Positions", x => x.Id);
                    table.UniqueConstraint("AK_Positions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Positions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Positions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Positions_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_JobLevels_TenantId_CompanyId_JobLevelId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobLevelId },
                        principalTable: "JobLevels",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_JobTitles_TenantId_CompanyId_JobTitleId",
                        columns: x => new { x.TenantId, x.CompanyId, x.JobTitleId },
                        principalTable: "JobTitles",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Positions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobDescriptions",
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
                        name: "FK_JobDescriptions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobDescriptions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_JobDescriptions_Tenants_TenantId",
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
                        name: "FK_JobRequisitions_Employees_TenantId_CompanyId_ReplacementEmployeeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ReplacementEmployeeId },
                        principalTable: "Employees",
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
                name: "WorkforcePlanLines",
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
                    table.PrimaryKey("PK_WorkforcePlanLines", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlanLines_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Branches_TenantId_CompanyId_BranchId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BranchId },
                        principalTable: "Branches",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Departments_TenantId_CompanyId_DepartmentId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DepartmentId },
                        principalTable: "Departments",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Divisions_TenantId_CompanyId_DivisionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DivisionId },
                        principalTable: "Divisions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Positions_TenantId_CompanyId_PositionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PositionId },
                        principalTable: "Positions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLines_WorkforcePlans_TenantId_CompanyId_WorkforcePlanId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanId },
                        principalTable: "WorkforcePlans",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
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
                name: "WorkforcePlanLinePeriodTargets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    WorkforcePlanLineId = table.Column<int>(type: "int", nullable: false),
                    FiscalPeriodId = table.Column<int>(type: "int", nullable: false),
                    NewHireSlots = table.Column<int>(type: "int", nullable: false),
                    ReplacementSlots = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_WorkforcePlanLinePeriodTargets", x => x.Id);
                    table.UniqueConstraint("AK_WorkforcePlanLinePeriodTargets_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_FiscalPeriods_TenantId_CompanyId_FiscalPeriodId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalPeriodId },
                        principalTable: "FiscalPeriods",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WorkforcePlanLinePeriodTargets_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanLineId",
                        columns: x => new { x.TenantId, x.CompanyId, x.WorkforcePlanLineId },
                        principalTable: "WorkforcePlanLines",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
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
                    SkillEvaluationsJson = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
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

            migrationBuilder.CreateTable(
                name: "CrystalReportRoleGrants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    Rights = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_CrystalReportRoleGrants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_Companies_TenantId_CompanyId",
                        columns: x => new { x.TenantId, x.CompanyId },
                        principalTable: "Companies",
                        principalColumns: new[] { "TenantId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportRoleGrants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EntityKey = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    ReportKey = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CurrentPublishedVersionId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
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
                    table.PrimaryKey("PK_CrystalReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReports_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReports_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "CrystalReportVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CrystalReportId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    VersionNumber = table.Column<int>(type: "int", nullable: false),
                    StorageKey = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    OriginalFileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Sha256 = table.Column<string>(type: "nchar(64)", fixedLength: true, maxLength: 64, nullable: false),
                    SummaryTitle = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    SummarySubject = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ValidationStatus = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    ValidationReason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
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
                    table.PrimaryKey("PK_CrystalReportVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_CreatedById",
                        column: x => x.CreatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_DeletedById",
                        column: x => x.DeletedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_AspNetUsers_UpdatedById",
                        column: x => x.UpdatedById,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                        column: x => x.CrystalReportId,
                        principalTable: "CrystalReports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CrystalReportVersions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CountryId",
                table: "Addresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CreatedById",
                table: "Addresses",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_DeletedById",
                table: "Addresses",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_DistrictId",
                table: "Addresses",
                column: "DistrictId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_Latitude_Longitude",
                table: "Addresses",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_StateId",
                table: "Addresses",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId_CompanyId",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId_CompanyId_AddressTypeId",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId", "AddressTypeId" });

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UpdatedById",
                table: "Addresses",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_CreatedById",
                table: "AddressTypes",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_DeletedById",
                table: "AddressTypes",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_TenantId",
                table: "AddressTypes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_TenantId_CompanyId",
                table: "AddressTypes",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_TenantId_CompanyId_NameAr",
                table: "AddressTypes",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_TenantId_CompanyId_NameEn",
                table: "AddressTypes",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_UpdatedById",
                table: "AddressTypes",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_ClientUri",
                table: "ApiKeys",
                column: "ClientUri");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_KeyHash",
                table: "ApiKeys",
                column: "KeyHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId",
                table: "ApiKeys",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId_CompanyId",
                table: "ApiKeys",
                columns: new[] { "TenantId", "CompanyId" });

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
                name: "IX_Appointments_CreatedById",
                table: "Appointments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_DeletedById",
                table: "Appointments",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId_CompanyId",
                table: "Appointments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_UpdatedById",
                table: "Appointments",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoles_System_NormalizedName",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[IsSystem] = 1 AND [NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoles_Tenant_NormalizedName",
                table: "AspNetRoles",
                columns: new[] { "TenantId", "NormalizedName" },
                unique: true,
                filter: "[IsSystem] = 0 AND [TenantId] IS NOT NULL AND [NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TenantId",
                table: "AspNetUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_TenantId_LifecycleStatus",
                table: "AspNetUsers",
                columns: new[] { "TenantId", "LifecycleStatus" });

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_CreatedById",
                table: "AttendanceAgents",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_DeletedById",
                table: "AttendanceAgents",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_SecretHash",
                table: "AttendanceAgents",
                column: "SecretHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId",
                table: "AttendanceAgents",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_TenantId_CompanyId_NormalizedName",
                table: "AttendanceAgents",
                columns: new[] { "TenantId", "CompanyId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceAgents_UpdatedById",
                table: "AttendanceAgents",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_CreatedById",
                table: "AttendanceDeviceCredentials",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_DeletedById",
                table: "AttendanceDeviceCredentials",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId",
                table: "AttendanceDeviceCredentials",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId_CompanyId",
                table: "AttendanceDeviceCredentials",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_TenantId_CompanyId_AttendanceDeviceId",
                table: "AttendanceDeviceCredentials",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDeviceCredentials_UpdatedById",
                table: "AttendanceDeviceCredentials",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_CreatedById",
                table: "AttendanceDevices",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_DeletedById",
                table: "AttendanceDevices",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId",
                table: "AttendanceDevices",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_AttendanceAgentId",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "AttendanceAgentId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_BranchId",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_Enabled",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "Enabled" });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_TenantId_CompanyId_NormalizedName",
                table: "AttendanceDevices",
                columns: new[] { "TenantId", "CompanyId", "NormalizedName" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceDevices_UpdatedById",
                table: "AttendanceDevices",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_AuthenticationSelectionChallenges_ExpiresOn",
                table: "AuthenticationSelectionChallenges",
                column: "ExpiresOn");

            migrationBuilder.CreateIndex(
                name: "IX_AuthenticationSelectionChallenges_UserId_Scope",
                table: "AuthenticationSelectionChallenges",
                columns: new[] { "UserId", "Scope" });

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_CreatedById",
                table: "BranchAddresses",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_DeletedById",
                table: "BranchAddresses",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_TenantId",
                table: "BranchAddresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_TenantId_CompanyId",
                table: "BranchAddresses",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_TenantId_CompanyId_AddressId",
                table: "BranchAddresses",
                columns: new[] { "TenantId", "CompanyId", "AddressId" });

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_TenantId_CompanyId_BranchId_AddressId_Purpose",
                table: "BranchAddresses",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "AddressId", "Purpose" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_TenantId_CompanyId_BranchId_Purpose",
                table: "BranchAddresses",
                columns: new[] { "TenantId", "CompanyId", "BranchId", "Purpose" },
                unique: true,
                filter: "[IsPrimary] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_BranchAddresses_UpdatedById",
                table: "BranchAddresses",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_CreatedById",
                table: "Branches",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_DeletedById",
                table: "Branches",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId",
                table: "Branches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Branches_TenantId_CompanyId_BranchCode",
                table: "Branches",
                columns: new[] { "TenantId", "CompanyId", "BranchCode" },
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

            migrationBuilder.CreateIndex(
                name: "IX_Branches_UpdatedById",
                table: "Branches",
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
                name: "IX_Categories_CreatedById",
                table: "Categories",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_DeletedById",
                table: "Categories",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId",
                table: "Categories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_CompanyId",
                table: "Categories",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_CompanyId_NameAr",
                table: "Categories",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_TenantId_CompanyId_NameEn",
                table: "Categories",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_UpdatedById",
                table: "Categories",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_CategoryId",
                table: "CategorySubcategories",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_SubCategoryId",
                table: "CategorySubcategories",
                column: "SubCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_TenantId",
                table: "CategorySubcategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_TenantId_CompanyId",
                table: "CategorySubcategories",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Companies_CreatedById",
                table: "Companies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_DeletedById",
                table: "Companies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_ParentCompanyId",
                table: "Companies",
                column: "ParentCompanyId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_RegistrationCountryId",
                table: "Companies",
                column: "RegistrationCountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId",
                table: "Companies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId_CompanyCode",
                table: "Companies",
                columns: new[] { "TenantId", "CompanyCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId_NameAr",
                table: "Companies",
                columns: new[] { "TenantId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_TenantId_NameEn",
                table: "Companies",
                columns: new[] { "TenantId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_UpdatedById",
                table: "Companies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_CreatedById",
                table: "CompanyAddresses",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_DeletedById",
                table: "CompanyAddresses",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_TenantId",
                table: "CompanyAddresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_TenantId_CompanyId",
                table: "CompanyAddresses",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_TenantId_CompanyId_AddressId_Purpose",
                table: "CompanyAddresses",
                columns: new[] { "TenantId", "CompanyId", "AddressId", "Purpose" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_TenantId_CompanyId_Purpose",
                table: "CompanyAddresses",
                columns: new[] { "TenantId", "CompanyId", "Purpose" },
                unique: true,
                filter: "[IsPrimary] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyAddresses_UpdatedById",
                table: "CompanyAddresses",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_CountryId",
                table: "CompanyCountries",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_CreatedById",
                table: "CompanyCountries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_DeletedById",
                table: "CompanyCountries",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId",
                table: "CompanyCountries",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId_CompanyId",
                table: "CompanyCountries",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true,
                filter: "[IsDefault] = 1 AND [IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_TenantId_CompanyId_CountryId",
                table: "CompanyCountries",
                columns: new[] { "TenantId", "CompanyId", "CountryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CompanyCountries_UpdatedById",
                table: "CompanyCountries",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_CreatedById",
                table: "CostCenters",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_DeletedById",
                table: "CostCenters",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId",
                table: "CostCenters",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_CostCenterCode",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "CostCenterCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_NameAr",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "NameAr" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_NameEn",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "NameEn" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_TenantId_CompanyId_ParentCostCenterId",
                table: "CostCenters",
                columns: new[] { "TenantId", "CompanyId", "ParentCostCenterId" });

            migrationBuilder.CreateIndex(
                name: "IX_CostCenters_UpdatedById",
                table: "CostCenters",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Alpha2Code",
                table: "Countries",
                column: "Alpha2Code",
                unique: true,
                filter: "[Alpha2Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_Alpha3Code",
                table: "Countries",
                column: "Alpha3Code",
                unique: true,
                filter: "[Alpha3Code] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_CreatedById",
                table: "Countries",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_DeletedById",
                table: "Countries",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Countries_NameAr",
                table: "Countries",
                column: "NameAr",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_NameEn",
                table: "Countries",
                column: "NameEn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Countries_UpdatedById",
                table: "Countries",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_CreatedById",
                table: "CrystalReportRoleGrants",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_CrystalReportId",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_DeletedById",
                table: "CrystalReportRoleGrants",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_RoleId",
                table: "CrystalReportRoleGrants",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId",
                table: "CrystalReportRoleGrants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_TenantId_CompanyId_CrystalReportId_RoleId",
                table: "CrystalReportRoleGrants",
                columns: new[] { "TenantId", "CompanyId", "CrystalReportId", "RoleId" },
                unique: true,
                filter: "[IsDeleted] = 0");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportRoleGrants_UpdatedById",
                table: "CrystalReportRoleGrants",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_CreatedById",
                table: "CrystalReports",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_CurrentPublishedVersionId",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_DeletedById",
                table: "CrystalReports",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId",
                table: "CrystalReports",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_IsDeleted_DisplayName",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "IsDeleted", "DisplayName" });

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_TenantId_EntityKey_ReportKey",
                table: "CrystalReports",
                columns: new[] { "TenantId", "EntityKey", "ReportKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReports_UpdatedById",
                table: "CrystalReports",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_CreatedById",
                table: "CrystalReportVersions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_CrystalReportId",
                table: "CrystalReportVersions",
                column: "CrystalReportId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_DeletedById",
                table: "CrystalReportVersions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId",
                table: "CrystalReportVersions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_CrystalReportId_VersionNumber",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "CrystalReportId", "VersionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_TenantId_StorageKey",
                table: "CrystalReportVersions",
                columns: new[] { "TenantId", "StorageKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CrystalReportVersions_UpdatedById",
                table: "CrystalReportVersions",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_CreatedById",
                table: "Currencies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_DeletedById",
                table: "Currencies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId",
                table: "Currencies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_CompanyId",
                table: "Currencies",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_CompanyId_CurrencyCode",
                table: "Currencies",
                columns: new[] { "TenantId", "CompanyId", "CurrencyCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_UpdatedById",
                table: "Currencies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_CreatedById",
                table: "Departments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_DeletedById",
                table: "Departments",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId",
                table: "Departments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_TenantId_CompanyId",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId" });

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
                name: "IX_Departments_TenantId_CompanyId_DepartmentCode",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "DepartmentCode" },
                unique: true);

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
                name: "IX_Departments_TenantId_CompanyId_ParentDepartmentId",
                table: "Departments",
                columns: new[] { "TenantId", "CompanyId", "ParentDepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_UpdatedById",
                table: "Departments",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_CreatedById",
                table: "DevicePullRuns",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_DeletedById",
                table: "DevicePullRuns",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId",
                table: "DevicePullRuns",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_AttendanceDeviceId_OperationId",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "OperationId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_ClaimedByAttendanceAgentId_LeaseExpiresAtUtc",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "ClaimedByAttendanceAgentId", "LeaseExpiresAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_TenantId_CompanyId_Status_StartedAtUtc",
                table: "DevicePullRuns",
                columns: new[] { "TenantId", "CompanyId", "Status", "StartedAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_DevicePullRuns_UpdatedById",
                table: "DevicePullRuns",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_Code_StateId",
                table: "Districts",
                columns: new[] { "Code", "StateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Districts_CreatedById",
                table: "Districts",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_DeletedById",
                table: "Districts",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_NameAr_StateId",
                table: "Districts",
                columns: new[] { "NameAr", "StateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Districts_NameEn_StateId",
                table: "Districts",
                columns: new[] { "NameEn", "StateId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Districts_StateId",
                table: "Districts",
                column: "StateId");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_UpdatedById",
                table: "Districts",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_CreatedById",
                table: "Divisions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_DeletedById",
                table: "Divisions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId",
                table: "Divisions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_TenantId_CompanyId",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId" });

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
                name: "IX_Divisions_TenantId_CompanyId_DivisionCode",
                table: "Divisions",
                columns: new[] { "TenantId", "CompanyId", "DivisionCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Divisions_UpdatedById",
                table: "Divisions",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_CreatedById",
                table: "EmployeeAssignments",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_DeletedById",
                table: "EmployeeAssignments",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId",
                table: "EmployeeAssignments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_BranchId",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_DepartmentId",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_EmployeeId",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_TenantId_CompanyId_PositionId",
                table: "EmployeeAssignments",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAssignments_UpdatedById",
                table: "EmployeeAssignments",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_CreatedById",
                table: "EmployeeContracts",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_DeletedById",
                table: "EmployeeContracts",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId",
                table: "EmployeeContracts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId_ContractNumber",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId", "ContractNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_TenantId_CompanyId_EmployeeId",
                table: "EmployeeContracts",
                columns: new[] { "TenantId", "CompanyId", "EmployeeId" });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeContracts_UpdatedById",
                table: "EmployeeContracts",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_CreatedById",
                table: "Employees",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_DeletedById",
                table: "Employees",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId",
                table: "Employees",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CandidateId",
                table: "Employees",
                columns: new[] { "TenantId", "CandidateId" },
                filter: "[CandidateId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId_EmployeeNumber",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId", "EmployeeNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TenantId_CompanyId_UserId",
                table: "Employees",
                columns: new[] { "TenantId", "CompanyId", "UserId" },
                unique: true,
                filter: "[UserId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_UpdatedById",
                table: "Employees",
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
                columns: new[] { "TenantId", "CompanyId", "CandidateId", "JobOpeningId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3, 4, 5, 6, 7, 8, 9)");

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
                name: "IX_EntityChangeLogs_TenantId",
                table: "EntityChangeLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EntityChangeLogs_TenantId_CompanyId",
                table: "EntityChangeLogs",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Files_CreatedById",
                table: "Files",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Files_DeletedById",
                table: "Files",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Files_TenantId",
                table: "Files",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_TenantId_CompanyId",
                table: "Files",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Files_UpdatedById",
                table: "Files",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_CreatedById",
                table: "FiscalPeriods",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_DeletedById",
                table: "FiscalPeriods",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId",
                table: "FiscalPeriods",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_Code",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_FiscalYearId_Sequence",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "Sequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_UpdatedById",
                table: "FiscalPeriods",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_CreatedById",
                table: "FiscalYears",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_DeletedById",
                table: "FiscalYears",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId",
                table: "FiscalYears",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_Code",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_StartDate_EndDate_IsDeleted",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "StartDate", "EndDate", "IsDeleted" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_UpdatedById",
                table: "FiscalYears",
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
                name: "IX_JobDescriptions_CreatedById",
                table: "JobDescriptions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_DeletedById",
                table: "JobDescriptions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId",
                table: "JobDescriptions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_TenantId_CompanyId",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId" });

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
                name: "IX_JobDescriptions_TenantId_CompanyId_PositionId_Version",
                table: "JobDescriptions",
                columns: new[] { "TenantId", "CompanyId", "PositionId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobDescriptions_UpdatedById",
                table: "JobDescriptions",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_CreatedById",
                table: "JobLevels",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_DeletedById",
                table: "JobLevels",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId",
                table: "JobLevels",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_LevelCode",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "LevelCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_JobLevels_TenantId_CompanyId_LevelOrder",
                table: "JobLevels",
                columns: new[] { "TenantId", "CompanyId", "LevelOrder" },
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
                name: "IX_JobLevels_UpdatedById",
                table: "JobLevels",
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
                columns: new[] { "TenantId", "CompanyId", "EmploymentApplicationId" },
                unique: true,
                filter: "[Status] IN (1, 2, 3)");

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
                name: "IX_JobRequisitions_TenantId_CompanyId_ReplacementEmployeeId",
                table: "JobRequisitions",
                columns: new[] { "TenantId", "CompanyId", "ReplacementEmployeeId" });

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

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_CreatedById",
                table: "JobTitles",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_DeletedById",
                table: "JobTitles",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId",
                table: "JobTitles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_TenantId_CompanyId_JobTitleCode",
                table: "JobTitles",
                columns: new[] { "TenantId", "CompanyId", "JobTitleCode" },
                unique: true);

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
                name: "IX_JobTitles_UpdatedById",
                table: "JobTitles",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_LoginAudits_TenantId",
                table: "LoginAudits",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoginAudits_TenantId_CompanyId",
                table: "LoginAudits",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_LoginAudits_UserId",
                table: "LoginAudits",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ActorUserId",
                table: "Notifications",
                column: "ActorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId",
                table: "Notifications",
                column: "RecipientUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId",
                table: "Notifications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_CompanyId",
                table: "Notifications",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_CreatedOn_Id",
                table: "Notifications",
                columns: new[] { "TenantId", "CompanyId", "RecipientUserId", "CreatedOn", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_DeduplicationKey",
                table: "Notifications",
                columns: new[] { "TenantId", "CompanyId", "RecipientUserId", "DeduplicationKey" },
                unique: true,
                filter: "[DeduplicationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_ReadOn",
                table: "Notifications",
                columns: new[] { "TenantId", "CompanyId", "RecipientUserId", "ReadOn" },
                filter: "[DismissedOn] IS NULL AND [ReadOn] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_CreatedById",
                table: "Positions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_DeletedById",
                table: "Positions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId",
                table: "Positions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_DivisionId",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_JobLevelId",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "JobLevelId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_JobTitleId",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "JobTitleId" });

            migrationBuilder.CreateIndex(
                name: "IX_Positions_TenantId_CompanyId_PositionCode",
                table: "Positions",
                columns: new[] { "TenantId", "CompanyId", "PositionCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Positions_UpdatedById",
                table: "Positions",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_CreatedById",
                table: "RawAttendancePunches",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_DeletedById",
                table: "RawAttendancePunches",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId",
                table: "RawAttendancePunches",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId_AttendanceDeviceId_IdempotencyKey",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "IdempotencyKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_TenantId_CompanyId_AttendanceDeviceId_OccurredAtUtc",
                table: "RawAttendancePunches",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "OccurredAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_RawAttendancePunches_UpdatedById",
                table: "RawAttendancePunches",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_CreatedById",
                table: "RawDeviceUsers",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_DeletedById",
                table: "RawDeviceUsers",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId",
                table: "RawDeviceUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId_CompanyId",
                table: "RawDeviceUsers",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_TenantId_CompanyId_AttendanceDeviceId_ExternalCode",
                table: "RawDeviceUsers",
                columns: new[] { "TenantId", "CompanyId", "AttendanceDeviceId", "ExternalCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RawDeviceUsers_UpdatedById",
                table: "RawDeviceUsers",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_CreatedById",
                table: "RecruitmentEvaluationCriteria",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_DeletedById",
                table: "RecruitmentEvaluationCriteria",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_TenantId",
                table: "RecruitmentEvaluationCriteria",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_TenantId_Code",
                table: "RecruitmentEvaluationCriteria",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentEvaluationCriteria_UpdatedById",
                table: "RecruitmentEvaluationCriteria",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentPolicies_CreatedById",
                table: "RecruitmentPolicies",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentPolicies_DeletedById",
                table: "RecruitmentPolicies",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentPolicies_TenantId",
                table: "RecruitmentPolicies",
                column: "TenantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentPolicies_UpdatedById",
                table: "RecruitmentPolicies",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_CreatedById",
                table: "RecruitmentRejectionReasons",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_DeletedById",
                table: "RecruitmentRejectionReasons",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId",
                table: "RecruitmentRejectionReasons",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId_Category",
                table: "RecruitmentRejectionReasons",
                columns: new[] { "TenantId", "Category" });

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_TenantId_Code",
                table: "RecruitmentRejectionReasons",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentRejectionReasons_UpdatedById",
                table: "RecruitmentRejectionReasons",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_CreatedById",
                table: "RecruitmentSources",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_DeletedById",
                table: "RecruitmentSources",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_TenantId",
                table: "RecruitmentSources",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_TenantId_Code",
                table: "RecruitmentSources",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentSources_UpdatedById",
                table: "RecruitmentSources",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_CreatedById",
                table: "RecruitmentStages",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_DeletedById",
                table: "RecruitmentStages",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId",
                table: "RecruitmentStages",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId_Code",
                table: "RecruitmentStages",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_TenantId_Sequence",
                table: "RecruitmentStages",
                columns: new[] { "TenantId", "Sequence" });

            migrationBuilder.CreateIndex(
                name: "IX_RecruitmentStages_UpdatedById",
                table: "RecruitmentStages",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_SessionId",
                table: "RefreshToken",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_TokenHash",
                table: "RefreshToken",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsCategories_CreatedById",
                table: "ReportsCategories",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsCategories_DeletedById",
                table: "ReportsCategories",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsCategories_Name",
                table: "ReportsCategories",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsCategories_UpdatedById",
                table: "ReportsCategories",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsDetails_CreatedById",
                table: "ReportsDetails",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsDetails_DeletedById",
                table: "ReportsDetails",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsDetails_ReportMasterId",
                table: "ReportsDetails",
                column: "ReportMasterId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsDetails_UpdatedById",
                table: "ReportsDetails",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_CreatedById",
                table: "ReportsMasters",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_DeletedById",
                table: "ReportsMasters",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_ExportedName",
                table: "ReportsMasters",
                column: "ExportedName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_ReportCategoryId",
                table: "ReportsMasters",
                column: "ReportCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_ReportName",
                table: "ReportsMasters",
                column: "ReportName",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportsMasters_UpdatedById",
                table: "ReportsMasters",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_CreatedById",
                table: "ReportTemplateRevisions",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_DeletedById",
                table: "ReportTemplateRevisions",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_ReportTemplateId",
                table: "ReportTemplateRevisions",
                column: "ReportTemplateId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_TenantId",
                table: "ReportTemplateRevisions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_TenantId_ReportTemplateId_RevisionNumber",
                table: "ReportTemplateRevisions",
                columns: new[] { "TenantId", "ReportTemplateId", "RevisionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplateRevisions_UpdatedById",
                table: "ReportTemplateRevisions",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_CreatedById",
                table: "ReportTemplates",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_DeletedById",
                table: "ReportTemplates",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId",
                table: "ReportTemplates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId_FeatureKey_IsDeleted_IsPublished_Name",
                table: "ReportTemplates",
                columns: new[] { "TenantId", "FeatureKey", "IsDeleted", "IsPublished", "Name" });

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_TenantId_FeatureKey_Name",
                table: "ReportTemplates",
                columns: new[] { "TenantId", "FeatureKey", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReportTemplates_UpdatedById",
                table: "ReportTemplates",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_ActorUserId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "ActorUserId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_TargetType_TargetId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "TargetType", "TargetId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_SecurityAuditEvents_TenantId_OccurredOn",
                table: "SecurityAuditEvents",
                columns: new[] { "TenantId", "OccurredOn" });

            migrationBuilder.CreateIndex(
                name: "IX_States_Code_CountryId",
                table: "States",
                columns: new[] { "Code", "CountryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_CountryId",
                table: "States",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_States_CreatedById",
                table: "States",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_States_DeletedById",
                table: "States",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_States_NameAr_CountryId",
                table: "States",
                columns: new[] { "NameAr", "CountryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_NameEn_CountryId",
                table: "States",
                columns: new[] { "NameEn", "CountryId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_States_UpdatedById",
                table: "States",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_CreatedById",
                table: "SubCategories",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_DeletedById",
                table: "SubCategories",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_TenantId",
                table: "SubCategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_TenantId_CompanyId",
                table: "SubCategories",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_TenantId_CompanyId_NameAr",
                table: "SubCategories",
                columns: new[] { "TenantId", "CompanyId", "NameAr" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_TenantId_CompanyId_NameEn",
                table: "SubCategories",
                columns: new[] { "TenantId", "CompanyId", "NameEn" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_UpdatedById",
                table: "SubCategories",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_Identifier",
                table: "Tenants",
                column: "Identifier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyAccesses_TenantId",
                table: "UserCompanyAccesses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyAccesses_TenantId_CompanyId",
                table: "UserCompanyAccesses",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_InvitedByUserId",
                table: "UserInvitations",
                column: "InvitedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_TenantId",
                table: "UserInvitations",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_TenantId_NormalizedEmail_Status",
                table: "UserInvitations",
                columns: new[] { "TenantId", "NormalizedEmail", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_TenantId_NormalizedUserName_Status",
                table: "UserInvitations",
                columns: new[] { "TenantId", "NormalizedUserName", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_UserInvitations_TokenHash",
                table: "UserInvitations",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserTenantAccesses_TenantId",
                table: "UserTenantAccesses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_UserTenantAccesses_TenantId_IsDefault",
                table: "UserTenantAccesses",
                columns: new[] { "TenantId", "IsDefault" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_CreatedById",
                table: "WorkforcePlanLinePeriodTargets",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_DeletedById",
                table: "WorkforcePlanLinePeriodTargets",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId",
                table: "WorkforcePlanLinePeriodTargets",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId_CompanyId",
                table: "WorkforcePlanLinePeriodTargets",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId_CompanyId_FiscalPeriodId",
                table: "WorkforcePlanLinePeriodTargets",
                columns: new[] { "TenantId", "CompanyId", "FiscalPeriodId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_TenantId_CompanyId_WorkforcePlanLineId_FiscalPeriodId",
                table: "WorkforcePlanLinePeriodTargets",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanLineId", "FiscalPeriodId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLinePeriodTargets_UpdatedById",
                table: "WorkforcePlanLinePeriodTargets",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_CreatedById",
                table: "WorkforcePlanLines",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_DeletedById",
                table: "WorkforcePlanLines",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId",
                table: "WorkforcePlanLines",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_BranchId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "BranchId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_DepartmentId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "DepartmentId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_DivisionId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "DivisionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_PositionId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_TenantId_CompanyId_WorkforcePlanId_PositionId",
                table: "WorkforcePlanLines",
                columns: new[] { "TenantId", "CompanyId", "WorkforcePlanId", "PositionId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlanLines_UpdatedById",
                table: "WorkforcePlanLines",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_CreatedById",
                table: "WorkforcePlans",
                column: "CreatedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_DeletedById",
                table: "WorkforcePlans",
                column: "DeletedById");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId",
                table: "WorkforcePlans",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId_CompanyId",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_TenantId_CompanyId_FiscalYearId_PlanCode_RevisionNumber",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "PlanCode", "RevisionNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkforcePlans_UpdatedById",
                table: "WorkforcePlans",
                column: "UpdatedById");

            migrationBuilder.CreateIndex(
                name: "UX_WorkforcePlans_OneEffectivePerFiscalYear",
                table: "WorkforcePlans",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId" },
                unique: true,
                filter: "[Status] = 4 AND [ActivatedOn] IS NOT NULL AND [SupersededOn] IS NULL AND [IsDeleted] = 0");

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReportRoleGrants_CrystalReports_CrystalReportId",
                table: "CrystalReportRoleGrants",
                column: "CrystalReportId",
                principalTable: "CrystalReports",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CrystalReports_CrystalReportVersions_CurrentPublishedVersionId",
                table: "CrystalReports",
                column: "CurrentPublishedVersionId",
                principalTable: "CrystalReportVersions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReports_AspNetUsers_CreatedById",
                table: "CrystalReports");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReports_AspNetUsers_DeletedById",
                table: "CrystalReports");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReports_AspNetUsers_UpdatedById",
                table: "CrystalReports");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_AspNetUsers_CreatedById",
                table: "CrystalReportVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_AspNetUsers_DeletedById",
                table: "CrystalReportVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_AspNetUsers_UpdatedById",
                table: "CrystalReportVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReports_Tenants_TenantId",
                table: "CrystalReports");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_Tenants_TenantId",
                table: "CrystalReportVersions");

            migrationBuilder.DropForeignKey(
                name: "FK_CrystalReportVersions_CrystalReports_CrystalReportId",
                table: "CrystalReportVersions");

            migrationBuilder.DropTable(
                name: "ApiKeys");

            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories");

            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "AttendanceDeviceCredentials");

            migrationBuilder.DropTable(
                name: "AuthenticationSelectionChallenges");

            migrationBuilder.DropTable(
                name: "BranchAddresses");

            migrationBuilder.DropTable(
                name: "CategorySubcategories");

            migrationBuilder.DropTable(
                name: "CompanyAddresses");

            migrationBuilder.DropTable(
                name: "CompanyCountries");

            migrationBuilder.DropTable(
                name: "CostCenters");

            migrationBuilder.DropTable(
                name: "CrystalReportRoleGrants");

            migrationBuilder.DropTable(
                name: "Currencies");

            migrationBuilder.DropTable(
                name: "DevicePullRuns");

            migrationBuilder.DropTable(
                name: "EmployeeAssignments");

            migrationBuilder.DropTable(
                name: "EmployeeContracts");

            migrationBuilder.DropTable(
                name: "EntityChangeLogs");

            migrationBuilder.DropTable(
                name: "Files");

            migrationBuilder.DropTable(
                name: "InterviewEvaluations");

            migrationBuilder.DropTable(
                name: "InterviewParticipants");

            migrationBuilder.DropTable(
                name: "JobDescriptions");

            migrationBuilder.DropTable(
                name: "JobOffers");

            migrationBuilder.DropTable(
                name: "LoginAudits");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "RawAttendancePunches");

            migrationBuilder.DropTable(
                name: "RawDeviceUsers");

            migrationBuilder.DropTable(
                name: "RecruitmentEvaluationCriteria");

            migrationBuilder.DropTable(
                name: "RecruitmentPolicies");

            migrationBuilder.DropTable(
                name: "RecruitmentRejectionReasons");

            migrationBuilder.DropTable(
                name: "RecruitmentSources");

            migrationBuilder.DropTable(
                name: "RecruitmentStages");

            migrationBuilder.DropTable(
                name: "RefreshToken");

            migrationBuilder.DropTable(
                name: "ReportsDetails");

            migrationBuilder.DropTable(
                name: "ReportTemplateRevisions");

            migrationBuilder.DropTable(
                name: "SecurityAuditEvents");

            migrationBuilder.DropTable(
                name: "UserCompanyAccesses");

            migrationBuilder.DropTable(
                name: "UserInvitations");

            migrationBuilder.DropTable(
                name: "UserTenantAccesses");

            migrationBuilder.DropTable(
                name: "WorkforcePlanLinePeriodTargets");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "SubCategories");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "Interviews");

            migrationBuilder.DropTable(
                name: "AttendanceDevices");

            migrationBuilder.DropTable(
                name: "ReportsMasters");

            migrationBuilder.DropTable(
                name: "ReportTemplates");

            migrationBuilder.DropTable(
                name: "FiscalPeriods");

            migrationBuilder.DropTable(
                name: "WorkforcePlanLines");

            migrationBuilder.DropTable(
                name: "AddressTypes");

            migrationBuilder.DropTable(
                name: "Districts");

            migrationBuilder.DropTable(
                name: "EmploymentApplications");

            migrationBuilder.DropTable(
                name: "AttendanceAgents");

            migrationBuilder.DropTable(
                name: "ReportsCategories");

            migrationBuilder.DropTable(
                name: "WorkforcePlans");

            migrationBuilder.DropTable(
                name: "Candidates");

            migrationBuilder.DropTable(
                name: "JobPostings");

            migrationBuilder.DropTable(
                name: "FiscalYears");

            migrationBuilder.DropTable(
                name: "States");

            migrationBuilder.DropTable(
                name: "JobOpenings");

            migrationBuilder.DropTable(
                name: "JobRequisitions");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "Positions");

            migrationBuilder.DropTable(
                name: "Divisions");

            migrationBuilder.DropTable(
                name: "JobLevels");

            migrationBuilder.DropTable(
                name: "JobTitles");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropTable(
                name: "CrystalReports");

            migrationBuilder.DropTable(
                name: "CrystalReportVersions");
        }
    }
}
