using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RefactorAddressesForGlobalGeography : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Districts_DistrictId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Districts_States_StateId",
                table: "Districts");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_State_NameEn_EnglishOnly",
                table: "States");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_District_NameAr_ArabicOnly",
                table: "Districts");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_District_NameEn_EnglishOnly",
                table: "Districts");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_AddressType_NameAr_ArabicOnly",
                table: "AddressTypes");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_AddressType_NameEn_EnglishOnly",
                table: "AddressTypes");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Address_Latitude_Range",
                table: "Addresses");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Address_Longitude_Range",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "AddressId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "AddressId",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "IsDefault",
                table: "Addresses");

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Addresses",
                type: "float(18)",
                precision: 18,
                scale: 6,
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float(18)",
                oldPrecision: 18,
                oldScale: 6);

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Addresses",
                type: "float(18)",
                precision: 18,
                scale: 6,
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float(18)",
                oldPrecision: 18,
                oldScale: 6);

            migrationBuilder.AlterColumn<string>(
                name: "Floor",
                table: "Addresses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<int>(
                name: "DistrictId",
                table: "Addresses",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<string>(
                name: "BuildingNumber",
                table: "Addresses",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ApartmentNumber",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "AdditionalInfo",
                table: "Addresses",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Addresses",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CountryId",
                table: "Addresses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StateId",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetLine1",
                table: "Addresses",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetLine2",
                table: "Addresses",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            // Existing development rows can be mapped from their old District
            // hierarchy before the new required CountryId foreign key is added.
            migrationBuilder.Sql("""
                UPDATE address
                SET CountryId = state.CountryId,
                    StateId = state.Id
                FROM Addresses AS address
                INNER JOIN Districts AS district ON district.Id = address.DistrictId
                INNER JOIN States AS state ON state.Id = district.StateId
                WHERE address.CountryId = 0;
                """);

            migrationBuilder.Sql("""
                IF EXISTS (SELECT 1 FROM Addresses WHERE CountryId = 0)
                    THROW 51000, 'Existing addresses could not be mapped to a country.', 1;
                """);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_Addresses_TenantId_CompanyId_Id",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId", "Id" });

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

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_CountryId",
                table: "Addresses",
                column: "CountryId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_StateId",
                table: "Addresses",
                column: "StateId");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Address_Coordinates_Paired",
                table: "Addresses",
                sql: "([Latitude] IS NULL AND [Longitude] IS NULL) OR ([Latitude] IS NOT NULL AND [Longitude] IS NOT NULL)");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Address_Latitude_Range",
                table: "Addresses",
                sql: "[Latitude] IS NULL OR ([Latitude] >= -90 AND [Latitude] <= 90)");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Address_Longitude_Range",
                table: "Addresses",
                sql: "[Longitude] IS NULL OR ([Longitude] >= -180 AND [Longitude] <= 180)");

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

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Countries_CountryId",
                table: "Addresses",
                column: "CountryId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Districts_DistrictId",
                table: "Addresses",
                column: "DistrictId",
                principalTable: "Districts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_States_StateId",
                table: "Addresses",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Districts_States_StateId",
                table: "Districts",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Countries_CountryId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Districts_DistrictId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_States_StateId",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Districts_States_StateId",
                table: "Districts");

            migrationBuilder.DropTable(
                name: "BranchAddresses");

            migrationBuilder.DropTable(
                name: "CompanyAddresses");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_Addresses_TenantId_CompanyId_Id",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_CountryId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_StateId",
                table: "Addresses");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Address_Coordinates_Paired",
                table: "Addresses");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Address_Latitude_Range",
                table: "Addresses");

            migrationBuilder.DropCheckConstraint(
                name: "CHK_Address_Longitude_Range",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CountryId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StateId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StreetLine1",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "StreetLine2",
                table: "Addresses");

            migrationBuilder.AddColumn<int>(
                name: "AddressId",
                table: "Companies",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AddressId",
                table: "Branches",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "PostalCode",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Addresses",
                type: "float(18)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float(18)",
                oldPrecision: 18,
                oldScale: 6,
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Addresses",
                type: "float(18)",
                precision: 18,
                scale: 6,
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float(18)",
                oldPrecision: 18,
                oldScale: 6,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Floor",
                table: "Addresses",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "DistrictId",
                table: "Addresses",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "BuildingNumber",
                table: "Addresses",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ApartmentNumber",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "AdditionalInfo",
                table: "Addresses",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                table: "Addresses",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddCheckConstraint(
                name: "CHK_State_NameEn_EnglishOnly",
                table: "States",
                sql: "[NameEn] NOT LIKE '%[^A-Za-z ]%'");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_District_NameAr_ArabicOnly",
                table: "Districts",
                sql: "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_District_NameEn_EnglishOnly",
                table: "Districts",
                sql: "[NameEn] NOT LIKE '%[^A-Za-z ]%'");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_AddressType_NameAr_ArabicOnly",
                table: "AddressTypes",
                sql: "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_AddressType_NameEn_EnglishOnly",
                table: "AddressTypes",
                sql: "[NameEn] NOT LIKE '%[^A-Za-z ]%'");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Address_Latitude_Range",
                table: "Addresses",
                sql: "[Latitude] >= -90 AND [Latitude] <= 90");

            migrationBuilder.AddCheckConstraint(
                name: "CHK_Address_Longitude_Range",
                table: "Addresses",
                sql: "[Longitude] >= -180 AND [Longitude] <= 180");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Districts_DistrictId",
                table: "Addresses",
                column: "DistrictId",
                principalTable: "Districts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Districts_States_StateId",
                table: "Districts",
                column: "StateId",
                principalTable: "States",
                principalColumn: "Id");
        }
    }
}
