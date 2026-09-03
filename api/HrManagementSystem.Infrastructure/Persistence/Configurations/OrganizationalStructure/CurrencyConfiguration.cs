using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("Currencies");
        builder.Property(x => x.CurrencyCode).HasMaxLength(3).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(100).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(100).IsRequired();
        builder.Property(x => x.Symbol).HasMaxLength(10).IsRequired();
        builder.Property(x => x.ExchangeRateToDefault).HasPrecision(18, 6);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.CurrencyCode }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });
    }
}
