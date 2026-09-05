using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRecruitmentSettingsPersistence : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
