using ErpSystem.Modules.Accounting.Domain.Finance.LedgerSetup.Entities;
using ErpSystem.BuildingBlocks.Domain.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.LedgerSetup.Persistence;

internal static class LedgerSetupConfigurationSupport
{
    public static void ConfigureCompanyIdentity<TEntity>(
        EntityTypeBuilder<TEntity> builder)
        where TEntity : CompanyAuditableEntity
    {
        builder.HasAlternateKey("TenantId", "CompanyId", "Id");
    }
}

public sealed class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("Currencies");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(100).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(100).IsRequired();
        builder.Property(item => item.Symbol).HasMaxLength(10).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.CurrencyCode }).IsUnique();
    }
}

public sealed class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.ToTable("Books");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(30).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.IsPrimary })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0 AND [IsPrimary] = 1");
    }
}

public sealed class AccountingCompanySettingsConfiguration : IEntityTypeConfiguration<AccountingCompanySettings>
{
    public void Configure(EntityTypeBuilder<AccountingCompanySettings> builder)
    {
        builder.ToTable("AccountingCompanySettings");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.HasIndex(item => new { item.TenantId, item.CompanyId }).IsUnique();

        builder.HasOne(item => item.FunctionalCurrency)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.FunctionalCurrencyId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.PrimaryBook)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.PrimaryBookId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class AccountHierarchyLevelConfiguration : IEntityTypeConfiguration<AccountHierarchyLevel>
{
    public void Configure(EntityTypeBuilder<AccountHierarchyLevel> builder)
    {
        builder.ToTable("AccountHierarchyLevels");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.LevelNumber }).IsUnique();
    }
}

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.ToTable("Accounts");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(50).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(200).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.ParentAccountId });
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.AccountHierarchyLevelId });

        builder.HasOne(item => item.AccountHierarchyLevel)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.AccountHierarchyLevelId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.ParentAccount)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.ParentAccountId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.SpecificCurrency)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.SpecificCurrencyId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class DimensionDefinitionConfiguration : IEntityTypeConfiguration<DimensionDefinition>
{
    public void Configure(EntityTypeBuilder<DimensionDefinition> builder)
    {
        builder.ToTable("DimensionDefinitions");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(50).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
    }
}

public sealed class DimensionValueConfiguration : IEntityTypeConfiguration<DimensionValue>
{
    public void Configure(EntityTypeBuilder<DimensionValue> builder)
    {
        builder.ToTable("DimensionValues");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(80).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.DimensionDefinitionId,
            item.Code
        }).IsUnique();

        builder.HasOne(item => item.DimensionDefinition)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.DimensionDefinitionId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class AccountDimensionPolicyConfiguration : IEntityTypeConfiguration<AccountDimensionPolicy>
{
    public void Configure(EntityTypeBuilder<AccountDimensionPolicy> builder)
    {
        builder.ToTable("AccountDimensionPolicies");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.AccountId,
            item.DimensionDefinitionId
        }).IsUnique();

        builder.HasOne(item => item.Account)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.AccountId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.DimensionDefinition)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.DimensionDefinitionId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class JournalDefinitionConfiguration : IEntityTypeConfiguration<JournalDefinition>
{
    public void Configure(EntityTypeBuilder<JournalDefinition> builder)
    {
        builder.ToTable("JournalDefinitions");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(30).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.Property(item => item.CategoryCode).HasMaxLength(50).IsRequired();
        builder.Property(item => item.NumberPrefix).HasMaxLength(20).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.BookId, item.Code }).IsUnique();

        builder.HasOne(item => item.Book)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.BookId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class ExchangeRateTypeConfiguration : IEntityTypeConfiguration<ExchangeRateType>
{
    public void Configure(EntityTypeBuilder<ExchangeRateType> builder)
    {
        builder.ToTable("ExchangeRateTypes");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(30).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
    }
}

public sealed class ExchangeRateConfiguration : IEntityTypeConfiguration<ExchangeRate>
{
    public void Configure(EntityTypeBuilder<ExchangeRate> builder)
    {
        builder.ToTable("ExchangeRates");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Rate).HasPrecision(20, 10).IsRequired();
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.ExchangeRateTypeId,
            item.FromCurrencyId,
            item.ToCurrencyId,
            item.EffectiveFrom,
            item.Version
        }).IsUnique();
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.FromCurrencyId,
            item.ToCurrencyId,
            item.EffectiveFrom,
            item.EffectiveTo
        });

        builder.HasOne(item => item.ExchangeRateType)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.ExchangeRateTypeId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.FromCurrency)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.FromCurrencyId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.ToCurrency)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.ToCurrencyId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class AccountMappingConfiguration : IEntityTypeConfiguration<AccountMapping>
{
    public void Configure(EntityTypeBuilder<AccountMapping> builder)
    {
        builder.ToTable("AccountMappings");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.PurposeCode).HasMaxLength(100).IsRequired();
        builder.Property(item => item.SourceReferenceId).HasMaxLength(128);
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.BookId,
            item.PurposeCode,
            item.SourceType,
            item.SourceReferenceId,
            item.EffectiveFrom
        }).IsUnique();
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.BookId,
            item.PurposeCode,
            item.EffectiveFrom,
            item.EffectiveTo
        });

        builder.HasOne(item => item.Book)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.BookId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.Account)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.AccountId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class PostingProfileConfiguration : IEntityTypeConfiguration<PostingProfile>
{
    public void Configure(EntityTypeBuilder<PostingProfile> builder)
    {
        builder.ToTable("PostingProfiles");
        LedgerSetupConfigurationSupport.ConfigureCompanyIdentity(builder);
        builder.Property(item => item.Code).HasMaxLength(50).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(150).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(150).IsRequired();
        builder.Property(item => item.PurposeCode).HasMaxLength(100).IsRequired();
        builder.Property(item => item.ContextReferenceId).HasMaxLength(128);
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code, item.Version }).IsUnique();
        builder.HasIndex(item => new
        {
            item.TenantId,
            item.CompanyId,
            item.BookId,
            item.PurposeCode,
            item.ContextType,
            item.ContextReferenceId,
            item.EffectiveFrom,
            item.EffectiveTo,
            item.Priority
        });

        builder.HasOne(item => item.Book)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.BookId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(item => item.Account)
            .WithMany()
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.AccountId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
