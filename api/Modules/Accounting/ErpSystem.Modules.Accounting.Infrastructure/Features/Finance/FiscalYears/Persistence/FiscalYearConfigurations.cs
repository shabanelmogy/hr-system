using ErpSystem.Modules.Accounting.Domain.Finance.FiscalYears.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Accounting.Infrastructure.Features.Finance.FiscalYears.Persistence;

internal sealed class FiscalYearConfiguration : IEntityTypeConfiguration<FiscalYear>
{
    public void Configure(EntityTypeBuilder<FiscalYear> builder)
    {
        builder.ToTable("FiscalYears");
        builder.HasKey(item => item.Id);
        builder.HasAlternateKey(item => new { item.TenantId, item.CompanyId, item.Id });

        builder.Property(item => item.Code).HasMaxLength(32).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(200).IsRequired();

        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.StartDate, item.EndDate });

        builder.HasMany(item => item.Periods)
            .WithOne(item => item.FiscalYear)
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.FiscalYearId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(item => item.Periods).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}

internal sealed class FiscalPeriodConfiguration : IEntityTypeConfiguration<FiscalPeriod>
{
    public void Configure(EntityTypeBuilder<FiscalPeriod> builder)
    {
        builder.ToTable("FiscalPeriods");
        builder.HasKey(item => item.Id);

        builder.Property(item => item.Code).HasMaxLength(32).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(200).IsRequired();

        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.FiscalYearId, item.Sequence })
            .IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code })
            .IsUnique();
    }
}
