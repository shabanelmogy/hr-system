using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.ReferenceData.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddGlobalReferenceReportViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                IF OBJECT_ID(N'ref.vw_Countries') IS NOT NULL
                    OR OBJECT_ID(N'ref.vw_States') IS NOT NULL
                    OR OBJECT_ID(N'ref.vw_Districts') IS NOT NULL
                    THROW 51000, 'A prepared ReferenceData View already exists. Review ownership before applying this migration.', 1;

                DECLARE @countries nvarchar(max), @states nvarchar(max), @districts nvarchar(max);
                DECLARE @countryNavigation nvarchar(max), @stateNavigation nvarchar(max);
                SELECT @countries=STRING_AGG(CONVERT(nvarchar(max),N'c.'+QUOTENAME(name)),N',')
                    WITHIN GROUP (ORDER BY column_id),
                    @countryNavigation=STRING_AGG(CONVERT(nvarchar(max),N'c.'+QUOTENAME(name)+N' AS '+QUOTENAME(N'Country_'+name)),N',')
                    WITHIN GROUP (ORDER BY column_id)
                    FROM sys.columns WHERE object_id=OBJECT_ID(N'ref.Countries');
                SELECT @states=STRING_AGG(CONVERT(nvarchar(max),N's.'+QUOTENAME(name)),N',')
                    WITHIN GROUP (ORDER BY column_id),
                    @stateNavigation=STRING_AGG(CONVERT(nvarchar(max),N's.'+QUOTENAME(name)+N' AS '+QUOTENAME(N'State_'+name)),N',')
                    WITHIN GROUP (ORDER BY column_id)
                    FROM sys.columns WHERE object_id=OBJECT_ID(N'ref.States');
                SELECT @districts=STRING_AGG(CONVERT(nvarchar(max),N'd.'+QUOTENAME(name)),N',')
                    WITHIN GROUP (ORDER BY column_id)
                    FROM sys.columns WHERE object_id=OBJECT_ID(N'ref.Districts');

                -- Expand current physical columns once: schema-bound Views cannot use SELECT *.
                -- Navigation aliases are distinct from root columns and canonical Crystal fields.
                EXEC(N'CREATE VIEW ref.vw_Countries WITH SCHEMABINDING AS SELECT '+@countries+N','+@stateNavigation+N',
                    c.Id AS CountryId,c.NameAr AS CountryAr,c.NameEn AS CountryEn,
                    s.Id AS StateId,s.NameAr AS StateAr,s.NameEn AS StateEn
                    FROM ref.Countries c LEFT JOIN ref.States s ON s.CountryId=c.Id AND s.IsDeleted=0
                    WHERE c.IsDeleted=0');
                EXEC(N'CREATE VIEW ref.vw_States WITH SCHEMABINDING AS SELECT '+@states+N','+@countryNavigation+N',
                    s.Id AS StateId,s.NameAr AS StateAr,s.NameEn AS StateEn,s.Code AS StateCode,
                    ISNULL(c.NameAr,N'''') AS CountryAr,ISNULL(c.NameEn,N'''') AS CountryEn
                    FROM ref.States s LEFT JOIN ref.Countries c ON c.Id=s.CountryId AND c.IsDeleted=0
                    WHERE s.IsDeleted=0');
                EXEC(N'CREATE VIEW ref.vw_Districts WITH SCHEMABINDING AS SELECT '+@districts+N','+@stateNavigation+N','+@countryNavigation+N',
                    d.Id AS DistrictId,d.NameAr AS DistrictAr,d.NameEn AS DistrictEn,d.Code AS DistrictCode,
                    ISNULL(s.NameAr,N'''') AS StateAr,ISNULL(s.NameEn,N'''') AS StateEn
                    FROM ref.Districts d LEFT JOIN ref.States s ON s.Id=d.StateId AND s.IsDeleted=0
                    LEFT JOIN ref.Countries c ON c.Id=s.CountryId AND c.IsDeleted=0 WHERE d.IsDeleted=0');
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP VIEW ref.vw_Districts;
                DROP VIEW ref.vw_States;
                DROP VIEW ref.vw_Countries;
                """);
        }
    }
}
