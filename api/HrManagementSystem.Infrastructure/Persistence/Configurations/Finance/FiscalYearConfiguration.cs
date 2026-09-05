using HrManagementSystem.Domain.Finance.FiscalYears.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.Finance;

public sealed class FiscalYearConfiguration : IEntityTypeConfiguration<FiscalYear>
{
    public void Configure(EntityTypeBuilder<FiscalYear> builder)
    {
        builder.ToTable("FiscalYears");
        builder.HasKey(item => item.Id);
        builder.HasAlternateKey(item => new { item.TenantId, item.CompanyId, item.Id });
        builder.Property(item => item.Code).HasMaxLength(20).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(100).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(100).IsRequired();
        builder.Property(item => item.StartDate).HasColumnType("date");
        builder.Property(item => item.EndDate).HasColumnType("date");
        builder.Property(item => item.PeriodFrequency).HasConversion<int>();
        builder.Property(item => item.Status).HasConversion<int>();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.StartDate, item.EndDate, item.IsDeleted });
        builder.Navigation(item => item.Periods).UsePropertyAccessMode(PropertyAccessMode.Field);
        builder.HasMany(item => item.Periods)
            .WithOne(item => item.FiscalYear)
            .HasForeignKey(item => new { item.TenantId, item.CompanyId, item.FiscalYearId })
            .HasPrincipalKey(item => new { item.TenantId, item.CompanyId, item.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public sealed class FiscalPeriodConfiguration : IEntityTypeConfiguration<FiscalPeriod>
{
    public void Configure(EntityTypeBuilder<FiscalPeriod> builder)
    {
        builder.ToTable("FiscalPeriods");
        builder.HasKey(item => item.Id);
        builder.HasAlternateKey(item => new { item.TenantId, item.CompanyId, item.Id });
        builder.Property(item => item.Code).HasMaxLength(24).IsRequired();
        builder.Property(item => item.NameAr).HasMaxLength(100).IsRequired();
        builder.Property(item => item.NameEn).HasMaxLength(100).IsRequired();
        builder.Property(item => item.StartDate).HasColumnType("date");
        builder.Property(item => item.EndDate).HasColumnType("date");
        builder.Property(item => item.Status).HasConversion<int>();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.FiscalYearId, item.Sequence }).IsUnique();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId, item.Code }).IsUnique();
    }
}
