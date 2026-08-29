using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyRegistrationCountry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RegistrationCountryId",
                table: "Companies",
                type: "int",
                nullable: true);

            // Preserve the established operating-country choice for existing
            // companies without inventing a legal registration country where
            // no active default has been configured.
            migrationBuilder.Sql("""
                UPDATE company
                SET RegistrationCountryId = companyCountry.CountryId
                FROM Companies AS company
                INNER JOIN CompanyCountries AS companyCountry
                    ON companyCountry.TenantId = company.TenantId
                    AND companyCountry.CompanyId = company.Id
                WHERE company.RegistrationCountryId IS NULL
                    AND companyCountry.IsDefault = 1
                    AND companyCountry.IsDeleted = 0;
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_RegistrationCountryId",
                table: "Companies",
                column: "RegistrationCountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Countries_RegistrationCountryId",
                table: "Companies",
                column: "RegistrationCountryId",
                principalTable: "Countries",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Countries_RegistrationCountryId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_Companies_RegistrationCountryId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "RegistrationCountryId",
                table: "Companies");
        }
    }
}
