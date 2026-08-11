using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantCompanyIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_NameAr",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_NameEn",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientUserId_CreatedOn_Id",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientUserId_DeduplicationKey",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientUserId_ReadOn",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Categories_NameAr",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_NameEn",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_Key",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "ReplacedByTokenHash",
                table: "RefreshToken");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "SubCategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "SubCategories",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "RefreshToken",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Notifications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "Notifications",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "LoginAudits",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "LoginAudits",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Files",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "Files",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "EntityChangeLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "EntityChangeLogs",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "CategorySubcategories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "CategorySubcategories",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Categories",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "Categories",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "AspNetUsers",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Appointments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "Appointments",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "ApiKeys",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "ApiKeys",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Addresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "Addresses",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Identifier = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedOn = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LegalName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(254)", maxLength: 254, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    Website = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Logo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Background = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AddressId = table.Column<int>(type: "int", nullable: true),
                    EmployeeCountTarget = table.Column<int>(type: "int", nullable: false),
                    EmployeeCountExists = table.Column<int>(type: "int", nullable: false),
                    EmployeeCountNeeded = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
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
                        name: "FK_Companies_Tenants_TenantId",
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

            migrationBuilder.Sql(
                """
                DECLARE @TenantId nvarchar(32) = N'00000000000000000000000000000001';

                IF NOT EXISTS (SELECT 1 FROM [Tenants] WHERE [Id] = @TenantId)
                BEGIN
                    INSERT INTO [Tenants] ([Id], [Identifier], [Name], [IsActive], [CreatedOn])
                    VALUES (@TenantId, N'default', N'Default Tenant', 1, SYSUTCDATETIME());
                END;

                UPDATE [AspNetUsers]
                SET [TenantId] = @TenantId
                WHERE [TenantId] = N'';

                IF EXISTS (SELECT 1 FROM [AspNetUsers])
                BEGIN
                    DECLARE @OwnerUserId nvarchar(450) =
                        (SELECT TOP (1) [Id] FROM [AspNetUsers] ORDER BY [Id]);

                    INSERT INTO [Companies]
                    (
                        [NameEn], [NameAr], [EmployeeCountTarget], [EmployeeCountExists],
                        [EmployeeCountNeeded], [IsActive], [CreatedById], [CreatedOn],
                        [CreatedByPc], [IsDeleted], [TenantId]
                    )
                    VALUES
                    (
                        N'Default Company', N'الشركة الافتراضية', 0, 0, 0, 1,
                        @OwnerUserId, SYSUTCDATETIME(), N'migration', 0, @TenantId
                    );

                    DECLARE @CompanyId int = CONVERT(int, SCOPE_IDENTITY());

                    INSERT INTO [UserCompanyAccesses]
                        ([UserId], [CompanyId], [TenantId], [IsDefault], [CreatedOn])
                    SELECT [Id], @CompanyId, @TenantId, 1, SYSUTCDATETIME()
                    FROM [AspNetUsers];

                    UPDATE [Addresses] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [ApiKeys] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [Appointments] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [Categories] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [CategorySubcategories] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [EntityChangeLogs] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [Files] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [LoginAudits] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [Notifications] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [SubCategories] SET [TenantId] = @TenantId, [CompanyId] = @CompanyId;
                    UPDATE [RefreshToken] SET [CompanyId] = @CompanyId;
                END
                ELSE IF EXISTS
                (
                    SELECT 1 FROM [Addresses]
                    UNION ALL SELECT 1 FROM [ApiKeys]
                    UNION ALL SELECT 1 FROM [Appointments]
                    UNION ALL SELECT 1 FROM [Categories]
                    UNION ALL SELECT 1 FROM [CategorySubcategories]
                    UNION ALL SELECT 1 FROM [EntityChangeLogs]
                    UNION ALL SELECT 1 FROM [Files]
                    UNION ALL SELECT 1 FROM [LoginAudits]
                    UNION ALL SELECT 1 FROM [Notifications]
                    UNION ALL SELECT 1 FROM [SubCategories]
                    UNION ALL SELECT 1 FROM [RefreshToken]
                )
                BEGIN
                    THROW 51000, 'Tenant migration found company-owned data without an owning user.', 1;
                END;
                """);

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
                name: "IX_LoginAudits_TenantId",
                table: "LoginAudits",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_LoginAudits_TenantId_CompanyId",
                table: "LoginAudits",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Files_TenantId",
                table: "Files",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Files_TenantId_CompanyId",
                table: "Files",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_EntityChangeLogs_TenantId",
                table: "EntityChangeLogs",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_EntityChangeLogs_TenantId_CompanyId",
                table: "EntityChangeLogs",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_TenantId",
                table: "CategorySubcategories",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategories_TenantId_CompanyId",
                table: "CategorySubcategories",
                columns: new[] { "TenantId", "CompanyId" });

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
                name: "IX_AspNetUsers_TenantId",
                table: "AspNetUsers",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_TenantId_CompanyId",
                table: "Appointments",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId",
                table: "ApiKeys",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId_CompanyId",
                table: "ApiKeys",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_TenantId_CompanyId_Key",
                table: "ApiKeys",
                columns: new[] { "TenantId", "CompanyId", "Key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_TenantId_CompanyId",
                table: "Addresses",
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
                name: "IX_Companies_TenantId",
                table: "Companies",
                column: "TenantId");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Companies_TenantId_CompanyId",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Tenants_TenantId",
                table: "Addresses",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiKeys_Companies_TenantId_CompanyId",
                table: "ApiKeys",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ApiKeys_Tenants_TenantId",
                table: "ApiKeys",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Companies_TenantId_CompanyId",
                table: "Appointments",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Appointments_Tenants_TenantId",
                table: "Appointments",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Tenants_TenantId",
                table: "AspNetUsers",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Companies_TenantId_CompanyId",
                table: "Categories",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySubcategories_Companies_TenantId_CompanyId",
                table: "CategorySubcategories",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_CategorySubcategories_Tenants_TenantId",
                table: "CategorySubcategories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EntityChangeLogs_Companies_TenantId_CompanyId",
                table: "EntityChangeLogs",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_EntityChangeLogs_Tenants_TenantId",
                table: "EntityChangeLogs",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Companies_TenantId_CompanyId",
                table: "Files",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Files_Tenants_TenantId",
                table: "Files",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginAudits_Companies_TenantId_CompanyId",
                table: "LoginAudits",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginAudits_Tenants_TenantId",
                table: "LoginAudits",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Companies_TenantId_CompanyId",
                table: "Notifications",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_Tenants_TenantId",
                table: "Notifications",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubCategories_Companies_TenantId_CompanyId",
                table: "SubCategories",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SubCategories_Tenants_TenantId",
                table: "SubCategories",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Companies_TenantId_CompanyId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Tenants_TenantId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiKeys_Companies_TenantId_CompanyId",
                table: "ApiKeys");

            migrationBuilder.DropForeignKey(
                name: "FK_ApiKeys_Tenants_TenantId",
                table: "ApiKeys");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Companies_TenantId_CompanyId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_Appointments_Tenants_TenantId",
                table: "Appointments");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Tenants_TenantId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Companies_TenantId_CompanyId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_Categories_Tenants_TenantId",
                table: "Categories");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySubcategories_Companies_TenantId_CompanyId",
                table: "CategorySubcategories");

            migrationBuilder.DropForeignKey(
                name: "FK_CategorySubcategories_Tenants_TenantId",
                table: "CategorySubcategories");

            migrationBuilder.DropForeignKey(
                name: "FK_EntityChangeLogs_Companies_TenantId_CompanyId",
                table: "EntityChangeLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_EntityChangeLogs_Tenants_TenantId",
                table: "EntityChangeLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_Companies_TenantId_CompanyId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_Files_Tenants_TenantId",
                table: "Files");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginAudits_Companies_TenantId_CompanyId",
                table: "LoginAudits");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginAudits_Tenants_TenantId",
                table: "LoginAudits");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Companies_TenantId_CompanyId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_Tenants_TenantId",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_SubCategories_Companies_TenantId_CompanyId",
                table: "SubCategories");

            migrationBuilder.DropForeignKey(
                name: "FK_SubCategories_Tenants_TenantId",
                table: "SubCategories");

            migrationBuilder.DropTable(
                name: "UserCompanyAccesses");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_TenantId",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_TenantId_CompanyId",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_TenantId_CompanyId_NameAr",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_SubCategories_TenantId_CompanyId_NameEn",
                table: "SubCategories");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_RecipientUserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TenantId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TenantId_CompanyId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_CreatedOn_Id",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_DeduplicationKey",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_TenantId_CompanyId_RecipientUserId_ReadOn",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_LoginAudits_TenantId",
                table: "LoginAudits");

            migrationBuilder.DropIndex(
                name: "IX_LoginAudits_TenantId_CompanyId",
                table: "LoginAudits");

            migrationBuilder.DropIndex(
                name: "IX_Files_TenantId",
                table: "Files");

            migrationBuilder.DropIndex(
                name: "IX_Files_TenantId_CompanyId",
                table: "Files");

            migrationBuilder.DropIndex(
                name: "IX_EntityChangeLogs_TenantId",
                table: "EntityChangeLogs");

            migrationBuilder.DropIndex(
                name: "IX_EntityChangeLogs_TenantId_CompanyId",
                table: "EntityChangeLogs");

            migrationBuilder.DropIndex(
                name: "IX_CategorySubcategories_TenantId",
                table: "CategorySubcategories");

            migrationBuilder.DropIndex(
                name: "IX_CategorySubcategories_TenantId_CompanyId",
                table: "CategorySubcategories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId_CompanyId",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId_CompanyId_NameAr",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Categories_TenantId_CompanyId_NameEn",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_TenantId",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_TenantId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_Appointments_TenantId_CompanyId",
                table: "Appointments");

            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_TenantId",
                table: "ApiKeys");

            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_TenantId_CompanyId",
                table: "ApiKeys");

            migrationBuilder.DropIndex(
                name: "IX_ApiKeys_TenantId_CompanyId_Key",
                table: "ApiKeys");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_TenantId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_TenantId_CompanyId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "SubCategories");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "RefreshToken");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Notifications");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "LoginAudits");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "LoginAudits");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Files");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "EntityChangeLogs");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "EntityChangeLogs");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "CategorySubcategories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "CategorySubcategories");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "ApiKeys");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "Addresses");

            migrationBuilder.AddColumn<string>(
                name: "ReplacedByTokenHash",
                table: "RefreshToken",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_NameAr",
                table: "SubCategories",
                column: "NameAr",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SubCategories_NameEn",
                table: "SubCategories",
                column: "NameEn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_CreatedOn_Id",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "CreatedOn", "Id" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_DeduplicationKey",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "DeduplicationKey" },
                unique: true,
                filter: "[DeduplicationKey] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RecipientUserId_ReadOn",
                table: "Notifications",
                columns: new[] { "RecipientUserId", "ReadOn" },
                filter: "[DismissedOn] IS NULL AND [ReadOn] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Categories_NameAr",
                table: "Categories",
                column: "NameAr",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_NameEn",
                table: "Categories",
                column: "NameEn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ApiKeys_Key",
                table: "ApiKeys",
                column: "Key",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                table: "AspNetUserClaims",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                table: "AspNetUserLogins",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                table: "AspNetUserRoles",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                table: "AspNetUserTokens",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
