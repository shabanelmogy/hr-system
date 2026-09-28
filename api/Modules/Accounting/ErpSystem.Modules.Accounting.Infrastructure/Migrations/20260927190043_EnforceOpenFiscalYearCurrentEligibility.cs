using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Accounting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EnforceOpenFiscalYearCurrentEligibility : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Earlier development builds allowed Draft years to be selected as the
            // company Current year. Preserve legitimate Current years that have
            // progressed beyond Open, but clear the invalid legacy Draft marker.
            migrationBuilder.Sql(
                """
                UPDATE [acc].[FiscalYears]
                SET [IsCurrent] = CAST(0 AS bit)
                WHERE [IsCurrent] = CAST(1 AS bit)
                  AND [Status] = 1;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Data cleanup is intentionally irreversible: the former Current row
            // cannot be inferred safely after a valid replacement may be selected.
        }
    }
}
