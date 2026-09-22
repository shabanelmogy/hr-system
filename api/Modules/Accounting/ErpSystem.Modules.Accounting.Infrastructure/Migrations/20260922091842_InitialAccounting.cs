using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErpSystem.Modules.Accounting.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialAccounting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "acc");

            migrationBuilder.CreateTable(
                name: "AccountHierarchyLevels",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LevelNumber = table.Column<int>(type: "int", nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CanPost = table.Column<bool>(type: "bit", nullable: false),
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
                    table.PrimaryKey("PK_AccountHierarchyLevels", x => x.Id);
                    table.UniqueConstraint("AK_AccountHierarchyLevels_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "Books",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
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
                    table.PrimaryKey("PK_Books", x => x.Id);
                    table.UniqueConstraint("AK_Books_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "Currencies",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CurrencyCode = table.Column<string>(type: "nvarchar(3)", maxLength: 3, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Symbol = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
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
                    table.PrimaryKey("PK_Currencies", x => x.Id);
                    table.UniqueConstraint("AK_Currencies_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "DimensionDefinitions",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    ValueSource = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_DimensionDefinitions", x => x.Id);
                    table.UniqueConstraint("AK_DimensionDefinitions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRateTypes",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
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
                    table.PrimaryKey("PK_ExchangeRateTypes", x => x.Id);
                    table.UniqueConstraint("AK_ExchangeRateTypes_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "FiscalYears",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    PeriodFrequency = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalYears", x => x.Id);
                    table.UniqueConstraint("AK_FiscalYears_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "InboxMessages",
                schema: "acc",
                columns: table => new
                {
                    ConsumerName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EventVersion = table.Column<int>(type: "int", nullable: false),
                    CorrelationId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CausationId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    FirstReceivedOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    LastAttemptOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    ProcessedOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InboxMessages", x => new { x.ConsumerName, x.EventId });
                });

            migrationBuilder.CreateTable(
                name: "OutboxMessages",
                schema: "acc",
                columns: table => new
                {
                    EventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    EventName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    EventVersion = table.Column<int>(type: "int", nullable: false),
                    OccurredOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    CorrelationId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    CausationId = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Payload = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    Attempts = table.Column<int>(type: "int", nullable: false),
                    LastAttemptOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    NextAttemptOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    PublishedOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LastError = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OutboxMessages", x => x.EventId);
                });

            migrationBuilder.CreateTable(
                name: "PartyReferences",
                schema: "acc",
                columns: table => new
                {
                    PartyId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CompanyId = table.Column<int>(type: "int", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: true),
                    Phone = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    SourceEventId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SourceOccurredOnUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    SourceRevision = table.Column<long>(type: "bigint", nullable: false, defaultValue: 0L),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PartyReferences", x => new { x.TenantId, x.CompanyId, x.PartyId });
                });

            migrationBuilder.CreateTable(
                name: "JournalDefinitions",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    CategoryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NumberPrefix = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NumberPadding = table.Column<int>(type: "int", nullable: false),
                    ResetPolicy = table.Column<int>(type: "int", nullable: false),
                    NextNumber = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_JournalDefinitions", x => x.Id);
                    table.UniqueConstraint("AK_JournalDefinitions_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_JournalDefinitions_Books_TenantId_CompanyId_BookId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BookId },
                        principalSchema: "acc",
                        principalTable: "Books",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccountingCompanySettings",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FunctionalCurrencyId = table.Column<int>(type: "int", nullable: false),
                    PrimaryBookId = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_AccountingCompanySettings", x => x.Id);
                    table.UniqueConstraint("AK_AccountingCompanySettings_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AccountingCompanySettings_Books_TenantId_CompanyId_PrimaryBookId",
                        columns: x => new { x.TenantId, x.CompanyId, x.PrimaryBookId },
                        principalSchema: "acc",
                        principalTable: "Books",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountingCompanySettings_Currencies_TenantId_CompanyId_FunctionalCurrencyId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FunctionalCurrencyId },
                        principalSchema: "acc",
                        principalTable: "Currencies",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Accounts",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    AccountHierarchyLevelId = table.Column<int>(type: "int", nullable: false),
                    ParentAccountId = table.Column<int>(type: "int", nullable: true),
                    AllowPosting = table.Column<bool>(type: "bit", nullable: false),
                    ManualPostingPolicy = table.Column<int>(type: "int", nullable: false),
                    CurrencyPolicy = table.Column<int>(type: "int", nullable: false),
                    SpecificCurrencyId = table.Column<int>(type: "int", nullable: true),
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
                    table.PrimaryKey("PK_Accounts", x => x.Id);
                    table.UniqueConstraint("AK_Accounts_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_Accounts_AccountHierarchyLevels_TenantId_CompanyId_AccountHierarchyLevelId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AccountHierarchyLevelId },
                        principalSchema: "acc",
                        principalTable: "AccountHierarchyLevels",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Accounts_Accounts_TenantId_CompanyId_ParentAccountId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ParentAccountId },
                        principalSchema: "acc",
                        principalTable: "Accounts",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Accounts_Currencies_TenantId_CompanyId_SpecificCurrencyId",
                        columns: x => new { x.TenantId, x.CompanyId, x.SpecificCurrencyId },
                        principalSchema: "acc",
                        principalTable: "Currencies",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DimensionValues",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DimensionDefinitionId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
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
                    table.PrimaryKey("PK_DimensionValues", x => x.Id);
                    table.UniqueConstraint("AK_DimensionValues_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_DimensionValues_DimensionDefinitions_TenantId_CompanyId_DimensionDefinitionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DimensionDefinitionId },
                        principalSchema: "acc",
                        principalTable: "DimensionDefinitions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeRates",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExchangeRateTypeId = table.Column<int>(type: "int", nullable: false),
                    FromCurrencyId = table.Column<int>(type: "int", nullable: false),
                    ToCurrencyId = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
                    Version = table.Column<int>(type: "int", nullable: false),
                    Rate = table.Column<decimal>(type: "decimal(20,10)", precision: 20, scale: 10, nullable: false),
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
                    table.PrimaryKey("PK_ExchangeRates", x => x.Id);
                    table.UniqueConstraint("AK_ExchangeRates_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_ExchangeRates_Currencies_TenantId_CompanyId_FromCurrencyId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FromCurrencyId },
                        principalSchema: "acc",
                        principalTable: "Currencies",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExchangeRates_Currencies_TenantId_CompanyId_ToCurrencyId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ToCurrencyId },
                        principalSchema: "acc",
                        principalTable: "Currencies",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ExchangeRates_ExchangeRateTypes_TenantId_CompanyId_ExchangeRateTypeId",
                        columns: x => new { x.TenantId, x.CompanyId, x.ExchangeRateTypeId },
                        principalSchema: "acc",
                        principalTable: "ExchangeRateTypes",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FiscalPeriods",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    FiscalYearId = table.Column<int>(type: "int", nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_FiscalPeriods", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FiscalPeriods_FiscalYears_TenantId_CompanyId_FiscalYearId",
                        columns: x => new { x.TenantId, x.CompanyId, x.FiscalYearId },
                        principalSchema: "acc",
                        principalTable: "FiscalYears",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccountDimensionPolicies",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    DimensionDefinitionId = table.Column<int>(type: "int", nullable: false),
                    Requirement = table.Column<int>(type: "int", nullable: false),
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
                    table.PrimaryKey("PK_AccountDimensionPolicies", x => x.Id);
                    table.UniqueConstraint("AK_AccountDimensionPolicies_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AccountDimensionPolicies_Accounts_TenantId_CompanyId_AccountId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AccountId },
                        principalSchema: "acc",
                        principalTable: "Accounts",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountDimensionPolicies_DimensionDefinitions_TenantId_CompanyId_DimensionDefinitionId",
                        columns: x => new { x.TenantId, x.CompanyId, x.DimensionDefinitionId },
                        principalSchema: "acc",
                        principalTable: "DimensionDefinitions",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AccountMappings",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    PurposeCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SourceType = table.Column<int>(type: "int", nullable: false),
                    SourceReferenceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("PK_AccountMappings", x => x.Id);
                    table.UniqueConstraint("AK_AccountMappings_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_AccountMappings_Accounts_TenantId_CompanyId_AccountId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AccountId },
                        principalSchema: "acc",
                        principalTable: "Accounts",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AccountMappings_Books_TenantId_CompanyId_BookId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BookId },
                        principalSchema: "acc",
                        principalTable: "Books",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PostingProfiles",
                schema: "acc",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    BookId = table.Column<int>(type: "int", nullable: false),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NameAr = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NameEn = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    PurposeCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ContextType = table.Column<int>(type: "int", nullable: false),
                    ContextReferenceId = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    AccountId = table.Column<int>(type: "int", nullable: false),
                    Priority = table.Column<int>(type: "int", nullable: false),
                    Version = table.Column<int>(type: "int", nullable: false),
                    EffectiveFrom = table.Column<DateOnly>(type: "date", nullable: false),
                    EffectiveTo = table.Column<DateOnly>(type: "date", nullable: true),
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
                    table.PrimaryKey("PK_PostingProfiles", x => x.Id);
                    table.UniqueConstraint("AK_PostingProfiles_TenantId_CompanyId_Id", x => new { x.TenantId, x.CompanyId, x.Id });
                    table.ForeignKey(
                        name: "FK_PostingProfiles_Accounts_TenantId_CompanyId_AccountId",
                        columns: x => new { x.TenantId, x.CompanyId, x.AccountId },
                        principalSchema: "acc",
                        principalTable: "Accounts",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PostingProfiles_Books_TenantId_CompanyId_BookId",
                        columns: x => new { x.TenantId, x.CompanyId, x.BookId },
                        principalSchema: "acc",
                        principalTable: "Books",
                        principalColumns: new[] { "TenantId", "CompanyId", "Id" },
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AccountDimensionPolicies_TenantId",
                schema: "acc",
                table: "AccountDimensionPolicies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountDimensionPolicies_TenantId_CompanyId",
                schema: "acc",
                table: "AccountDimensionPolicies",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountDimensionPolicies_TenantId_CompanyId_AccountId_DimensionDefinitionId",
                schema: "acc",
                table: "AccountDimensionPolicies",
                columns: new[] { "TenantId", "CompanyId", "AccountId", "DimensionDefinitionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountDimensionPolicies_TenantId_CompanyId_DimensionDefinitionId",
                schema: "acc",
                table: "AccountDimensionPolicies",
                columns: new[] { "TenantId", "CompanyId", "DimensionDefinitionId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountHierarchyLevels_TenantId",
                schema: "acc",
                table: "AccountHierarchyLevels",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountHierarchyLevels_TenantId_CompanyId",
                schema: "acc",
                table: "AccountHierarchyLevels",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountHierarchyLevels_TenantId_CompanyId_LevelNumber",
                schema: "acc",
                table: "AccountHierarchyLevels",
                columns: new[] { "TenantId", "CompanyId", "LevelNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountingCompanySettings_TenantId",
                schema: "acc",
                table: "AccountingCompanySettings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountingCompanySettings_TenantId_CompanyId",
                schema: "acc",
                table: "AccountingCompanySettings",
                columns: new[] { "TenantId", "CompanyId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AccountingCompanySettings_TenantId_CompanyId_FunctionalCurrencyId",
                schema: "acc",
                table: "AccountingCompanySettings",
                columns: new[] { "TenantId", "CompanyId", "FunctionalCurrencyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountingCompanySettings_TenantId_CompanyId_PrimaryBookId",
                schema: "acc",
                table: "AccountingCompanySettings",
                columns: new[] { "TenantId", "CompanyId", "PrimaryBookId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountMappings_TenantId",
                schema: "acc",
                table: "AccountMappings",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_AccountMappings_TenantId_CompanyId",
                schema: "acc",
                table: "AccountMappings",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountMappings_TenantId_CompanyId_AccountId",
                schema: "acc",
                table: "AccountMappings",
                columns: new[] { "TenantId", "CompanyId", "AccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountMappings_TenantId_CompanyId_BookId_PurposeCode_EffectiveFrom_EffectiveTo",
                schema: "acc",
                table: "AccountMappings",
                columns: new[] { "TenantId", "CompanyId", "BookId", "PurposeCode", "EffectiveFrom", "EffectiveTo" });

            migrationBuilder.CreateIndex(
                name: "IX_AccountMappings_TenantId_CompanyId_BookId_PurposeCode_SourceType_SourceReferenceId_EffectiveFrom",
                schema: "acc",
                table: "AccountMappings",
                columns: new[] { "TenantId", "CompanyId", "BookId", "PurposeCode", "SourceType", "SourceReferenceId", "EffectiveFrom" },
                unique: true,
                filter: "[SourceReferenceId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId",
                schema: "acc",
                table: "Accounts",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_CompanyId",
                schema: "acc",
                table: "Accounts",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_CompanyId_AccountHierarchyLevelId",
                schema: "acc",
                table: "Accounts",
                columns: new[] { "TenantId", "CompanyId", "AccountHierarchyLevelId" });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_CompanyId_Code",
                schema: "acc",
                table: "Accounts",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_CompanyId_ParentAccountId",
                schema: "acc",
                table: "Accounts",
                columns: new[] { "TenantId", "CompanyId", "ParentAccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_Accounts_TenantId_CompanyId_SpecificCurrencyId",
                schema: "acc",
                table: "Accounts",
                columns: new[] { "TenantId", "CompanyId", "SpecificCurrencyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Books_TenantId",
                schema: "acc",
                table: "Books",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Books_TenantId_CompanyId",
                schema: "acc",
                table: "Books",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Books_TenantId_CompanyId_Code",
                schema: "acc",
                table: "Books",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Books_TenantId_CompanyId_IsPrimary",
                schema: "acc",
                table: "Books",
                columns: new[] { "TenantId", "CompanyId", "IsPrimary" },
                unique: true,
                filter: "[IsDeleted] = 0 AND [IsPrimary] = 1");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId",
                schema: "acc",
                table: "Currencies",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_CompanyId",
                schema: "acc",
                table: "Currencies",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_Currencies_TenantId_CompanyId_CurrencyCode",
                schema: "acc",
                table: "Currencies",
                columns: new[] { "TenantId", "CompanyId", "CurrencyCode" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DimensionDefinitions_TenantId",
                schema: "acc",
                table: "DimensionDefinitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DimensionDefinitions_TenantId_CompanyId",
                schema: "acc",
                table: "DimensionDefinitions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_DimensionDefinitions_TenantId_CompanyId_Code",
                schema: "acc",
                table: "DimensionDefinitions",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DimensionValues_TenantId",
                schema: "acc",
                table: "DimensionValues",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_DimensionValues_TenantId_CompanyId",
                schema: "acc",
                table: "DimensionValues",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_DimensionValues_TenantId_CompanyId_DimensionDefinitionId_Code",
                schema: "acc",
                table: "DimensionValues",
                columns: new[] { "TenantId", "CompanyId", "DimensionDefinitionId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId",
                schema: "acc",
                table: "ExchangeRates",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_CompanyId",
                schema: "acc",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_CompanyId_ExchangeRateTypeId_FromCurrencyId_ToCurrencyId_EffectiveFrom_Version",
                schema: "acc",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "CompanyId", "ExchangeRateTypeId", "FromCurrencyId", "ToCurrencyId", "EffectiveFrom", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_CompanyId_FromCurrencyId_ToCurrencyId_EffectiveFrom_EffectiveTo",
                schema: "acc",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "CompanyId", "FromCurrencyId", "ToCurrencyId", "EffectiveFrom", "EffectiveTo" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRates_TenantId_CompanyId_ToCurrencyId",
                schema: "acc",
                table: "ExchangeRates",
                columns: new[] { "TenantId", "CompanyId", "ToCurrencyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateTypes_TenantId",
                schema: "acc",
                table: "ExchangeRateTypes",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateTypes_TenantId_CompanyId",
                schema: "acc",
                table: "ExchangeRateTypes",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeRateTypes_TenantId_CompanyId_Code",
                schema: "acc",
                table: "ExchangeRateTypes",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId",
                schema: "acc",
                table: "FiscalPeriods",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId",
                schema: "acc",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_Code",
                schema: "acc",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalPeriods_TenantId_CompanyId_FiscalYearId_Sequence",
                schema: "acc",
                table: "FiscalPeriods",
                columns: new[] { "TenantId", "CompanyId", "FiscalYearId", "Sequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId",
                schema: "acc",
                table: "FiscalYears",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId",
                schema: "acc",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_Code",
                schema: "acc",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FiscalYears_TenantId_CompanyId_StartDate_EndDate",
                schema: "acc",
                table: "FiscalYears",
                columns: new[] { "TenantId", "CompanyId", "StartDate", "EndDate" });

            migrationBuilder.CreateIndex(
                name: "IX_InboxMessages_Status_LastAttemptOnUtc",
                schema: "acc",
                table: "InboxMessages",
                columns: new[] { "Status", "LastAttemptOnUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalDefinitions_TenantId",
                schema: "acc",
                table: "JournalDefinitions",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_JournalDefinitions_TenantId_CompanyId",
                schema: "acc",
                table: "JournalDefinitions",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_JournalDefinitions_TenantId_CompanyId_BookId_Code",
                schema: "acc",
                table: "JournalDefinitions",
                columns: new[] { "TenantId", "CompanyId", "BookId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OutboxMessages_Status_NextAttemptOnUtc_OccurredOnUtc",
                schema: "acc",
                table: "OutboxMessages",
                columns: new[] { "Status", "NextAttemptOnUtc", "OccurredOnUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_PartyReferences_PartyId",
                schema: "acc",
                table: "PartyReferences",
                column: "PartyId");

            migrationBuilder.CreateIndex(
                name: "IX_PostingProfiles_TenantId",
                schema: "acc",
                table: "PostingProfiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_PostingProfiles_TenantId_CompanyId",
                schema: "acc",
                table: "PostingProfiles",
                columns: new[] { "TenantId", "CompanyId" });

            migrationBuilder.CreateIndex(
                name: "IX_PostingProfiles_TenantId_CompanyId_AccountId",
                schema: "acc",
                table: "PostingProfiles",
                columns: new[] { "TenantId", "CompanyId", "AccountId" });

            migrationBuilder.CreateIndex(
                name: "IX_PostingProfiles_TenantId_CompanyId_BookId_PurposeCode_ContextType_ContextReferenceId_EffectiveFrom_EffectiveTo_Priority",
                schema: "acc",
                table: "PostingProfiles",
                columns: new[] { "TenantId", "CompanyId", "BookId", "PurposeCode", "ContextType", "ContextReferenceId", "EffectiveFrom", "EffectiveTo", "Priority" });

            migrationBuilder.CreateIndex(
                name: "IX_PostingProfiles_TenantId_CompanyId_Code_Version",
                schema: "acc",
                table: "PostingProfiles",
                columns: new[] { "TenantId", "CompanyId", "Code", "Version" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AccountDimensionPolicies",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "AccountingCompanySettings",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "AccountMappings",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "DimensionValues",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "ExchangeRates",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "FiscalPeriods",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "InboxMessages",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "JournalDefinitions",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "OutboxMessages",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "PartyReferences",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "PostingProfiles",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "DimensionDefinitions",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "ExchangeRateTypes",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "FiscalYears",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "Accounts",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "Books",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "AccountHierarchyLevels",
                schema: "acc");

            migrationBuilder.DropTable(
                name: "Currencies",
                schema: "acc");
        }
    }
}
