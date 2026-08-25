using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HrManagementSystem.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class MakeAddressTypesCompanyScoped : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_AddressTypes_AddressTypeId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_AddressTypeId",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_NameAr",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_NameEn",
                table: "AddressTypes");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "AddressTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenantId",
                table: "AddressTypes",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "LegacyAddressTypeId",
                table: "AddressTypes",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(
                """
                IF EXISTS (SELECT 1 FROM [AddressTypes])
                   AND NOT EXISTS (SELECT 1 FROM [Companies])
                BEGIN
                    THROW 51019, 'Address Types exist but there is no Company to own them.', 1;
                END;

                IF EXISTS
                (
                    SELECT 1
                    FROM [Addresses] AS [address]
                    LEFT JOIN [AddressTypes] AS [addressType]
                        ON [addressType].[Id] = [address].[AddressTypeId]
                    LEFT JOIN [Companies] AS [company]
                        ON [company].[TenantId] = [address].[TenantId]
                       AND [company].[Id] = [address].[CompanyId]
                    WHERE [addressType].[Id] IS NULL
                       OR [company].[Id] IS NULL
                )
                BEGIN
                    THROW 51020, 'Address Type company-scope migration found an orphaned Address.', 1;
                END;

                DECLARE @CanonicalTenantId nvarchar(32);
                DECLARE @CanonicalCompanyId int;

                SELECT TOP (1)
                    @CanonicalTenantId = [TenantId],
                    @CanonicalCompanyId = [Id]
                FROM [Companies]
                ORDER BY [TenantId], [Id];

                UPDATE [AddressTypes]
                SET
                    [TenantId] = @CanonicalTenantId,
                    [CompanyId] = @CanonicalCompanyId,
                    [LegacyAddressTypeId] = [Id]
                WHERE [TenantId] IS NULL
                  AND [CompanyId] IS NULL;

                INSERT INTO [AddressTypes]
                (
                    [NameEn], [NameAr],
                    [CreatedById], [CreatedByPc], [CreatedOn],
                    [UpdatedById], [UpdatedByPc], [UpdatedOn],
                    [IsDeleted], [DeletedById], [DeletedByPc], [DeletedOn],
                    [TenantId], [CompanyId], [LegacyAddressTypeId]
                )
                SELECT
                    [source].[NameEn], [source].[NameAr],
                    [source].[CreatedById], [source].[CreatedByPc], [source].[CreatedOn],
                    [source].[UpdatedById], [source].[UpdatedByPc], [source].[UpdatedOn],
                    [source].[IsDeleted], [source].[DeletedById], [source].[DeletedByPc], [source].[DeletedOn],
                    [company].[TenantId], [company].[Id], [source].[Id]
                FROM [AddressTypes] AS [source]
                CROSS JOIN [Companies] AS [company]
                WHERE [source].[TenantId] = @CanonicalTenantId
                  AND [source].[CompanyId] = @CanonicalCompanyId
                  AND [source].[LegacyAddressTypeId] = [source].[Id]
                  AND NOT
                  (
                      [company].[TenantId] = @CanonicalTenantId
                      AND [company].[Id] = @CanonicalCompanyId
                  );

                IF EXISTS
                (
                    SELECT 1
                    FROM [Addresses] AS [address]
                    LEFT JOIN [AddressTypes] AS [scoped]
                      ON [scoped].[LegacyAddressTypeId] = [address].[AddressTypeId]
                     AND [scoped].[TenantId] = [address].[TenantId]
                     AND [scoped].[CompanyId] = [address].[CompanyId]
                    WHERE [scoped].[Id] IS NULL
                )
                BEGIN
                    THROW 51021, 'Address Type company-scope migration could not map every existing Address.', 1;
                END;

                UPDATE [address]
                SET [address].[AddressTypeId] = [scoped].[Id]
                FROM [Addresses] AS [address]
                INNER JOIN [AddressTypes] AS [scoped]
                  ON [scoped].[LegacyAddressTypeId] = [address].[AddressTypeId]
                 AND [scoped].[TenantId] = [address].[TenantId]
                 AND [scoped].[CompanyId] = [address].[CompanyId];

                UPDATE [changeLog]
                SET [changeLog].[EntityId] = [scoped].[Id]
                FROM [EntityChangeLogs] AS [changeLog]
                INNER JOIN [AddressTypes] AS [scoped]
                  ON [scoped].[LegacyAddressTypeId] = [changeLog].[EntityId]
                 AND [scoped].[TenantId] = [changeLog].[TenantId]
                 AND [scoped].[CompanyId] = [changeLog].[CompanyId]
                WHERE [changeLog].[EntityName] = N'AddressType';

                UPDATE [notification]
                SET [notification].[EntityId] = CONVERT(nvarchar(100), [scoped].[Id])
                FROM [Notifications] AS [notification]
                INNER JOIN [AddressTypes] AS [scoped]
                  ON [scoped].[LegacyAddressTypeId] = TRY_CONVERT(int, [notification].[EntityId])
                 AND [scoped].[TenantId] = [notification].[TenantId]
                 AND [scoped].[CompanyId] = [notification].[CompanyId]
                WHERE [notification].[EntityType] = N'AddressType';

                """);

            migrationBuilder.DropColumn(
                name: "LegacyAddressTypeId",
                table: "AddressTypes");

            migrationBuilder.AlterColumn<int>(
                name: "CompanyId",
                table: "AddressTypes",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "TenantId",
                table: "AddressTypes",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32,
                oldNullable: true);

            migrationBuilder.AddUniqueConstraint(
                name: "AK_AddressTypes_TenantId_CompanyId_Id",
                table: "AddressTypes",
                columns: new[] { "TenantId", "CompanyId", "Id" });

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
                name: "IX_Addresses_TenantId_CompanyId_AddressTypeId",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId", "AddressTypeId" });

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_AddressTypes_TenantId_CompanyId_AddressTypeId",
                table: "Addresses",
                columns: new[] { "TenantId", "CompanyId", "AddressTypeId" },
                principalTable: "AddressTypes",
                principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AddressTypes_Companies_TenantId_CompanyId",
                table: "AddressTypes",
                columns: new[] { "TenantId", "CompanyId" },
                principalTable: "Companies",
                principalColumns: new[] { "TenantId", "Id" },
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AddressTypes_Tenants_TenantId",
                table: "AddressTypes",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_AddressTypes_TenantId_CompanyId_AddressTypeId",
                table: "Addresses");

            migrationBuilder.Sql(
                """
                IF EXISTS
                (
                    SELECT [NameAr]
                    FROM [AddressTypes]
                    GROUP BY [NameAr]
                    HAVING COUNT(DISTINCT [NameEn]) > 1
                )
                OR EXISTS
                (
                    SELECT [NameEn]
                    FROM [AddressTypes]
                    GROUP BY [NameEn]
                    HAVING COUNT(DISTINCT [NameAr]) > 1
                )
                BEGIN
                    THROW 51022, 'Address Type rollback is unsafe because company catalogs contain conflicting bilingual names.', 1;
                END;

                SELECT
                    [Id] AS [ScopedId],
                    MIN([Id]) OVER (PARTITION BY [NameAr], [NameEn]) AS [CanonicalId]
                INTO [#AddressTypeRollbackMap]
                FROM [AddressTypes];

                CREATE UNIQUE CLUSTERED INDEX [IX_AddressTypeRollbackMap_ScopedId]
                    ON [#AddressTypeRollbackMap] ([ScopedId]);

                UPDATE [address]
                SET [address].[AddressTypeId] = [map].[CanonicalId]
                FROM [Addresses] AS [address]
                INNER JOIN [#AddressTypeRollbackMap] AS [map]
                    ON [map].[ScopedId] = [address].[AddressTypeId];

                UPDATE [changeLog]
                SET [changeLog].[EntityId] = [map].[CanonicalId]
                FROM [EntityChangeLogs] AS [changeLog]
                INNER JOIN [#AddressTypeRollbackMap] AS [map]
                    ON [map].[ScopedId] = [changeLog].[EntityId]
                WHERE [changeLog].[EntityName] = N'AddressType';

                UPDATE [notification]
                SET [notification].[EntityId] = CONVERT(nvarchar(100), [map].[CanonicalId])
                FROM [Notifications] AS [notification]
                INNER JOIN [#AddressTypeRollbackMap] AS [map]
                    ON [map].[ScopedId] = TRY_CONVERT(int, [notification].[EntityId])
                WHERE [notification].[EntityType] = N'AddressType';

                UPDATE [canonical]
                SET
                    [canonical].[IsDeleted] = 0,
                    [canonical].[DeletedById] = NULL,
                    [canonical].[DeletedByPc] = NULL,
                    [canonical].[DeletedOn] = NULL
                FROM [AddressTypes] AS [canonical]
                WHERE EXISTS
                (
                    SELECT 1
                    FROM [AddressTypes] AS [active]
                    INNER JOIN [#AddressTypeRollbackMap] AS [activeMap]
                        ON [activeMap].[ScopedId] = [active].[Id]
                    WHERE [activeMap].[CanonicalId] = [canonical].[Id]
                      AND [active].[IsDeleted] = 0
                );

                DELETE [duplicate]
                FROM [AddressTypes] AS [duplicate]
                INNER JOIN [#AddressTypeRollbackMap] AS [map]
                    ON [map].[ScopedId] = [duplicate].[Id]
                WHERE [map].[ScopedId] <> [map].[CanonicalId];

                DROP TABLE [#AddressTypeRollbackMap];
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_AddressTypes_Companies_TenantId_CompanyId",
                table: "AddressTypes");

            migrationBuilder.DropForeignKey(
                name: "FK_AddressTypes_Tenants_TenantId",
                table: "AddressTypes");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_AddressTypes_TenantId_CompanyId_Id",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_TenantId",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_TenantId_CompanyId",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_TenantId_CompanyId_NameAr",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_AddressTypes_TenantId_CompanyId_NameEn",
                table: "AddressTypes");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_TenantId_CompanyId_AddressTypeId",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "AddressTypes");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "AddressTypes");

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_NameAr",
                table: "AddressTypes",
                column: "NameAr",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AddressTypes_NameEn",
                table: "AddressTypes",
                column: "NameEn",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_AddressTypeId",
                table: "Addresses",
                column: "AddressTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_AddressTypes_AddressTypeId",
                table: "Addresses",
                column: "AddressTypeId",
                principalTable: "AddressTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
