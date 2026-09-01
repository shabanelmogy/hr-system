using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class JobLevelConfiguration : IEntityTypeConfiguration<JobLevel>
{
    public void Configure(EntityTypeBuilder<JobLevel> builder)
    {
        builder.ToTable("JobLevels");
        builder.Property(x => x.LevelCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.NameEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.NameAr).HasMaxLength(200).IsRequired();
        builder.Property(x => x.DescriptionEn).HasMaxLength(2000);
        builder.Property(x => x.DescriptionAr).HasMaxLength(2000);
        builder.Property(x => x.MinSalary).HasPrecision(18, 2);
        builder.Property(x => x.MaxSalary).HasPrecision(18, 2);
        builder.Property(x => x.CurrencyCode).HasMaxLength(3);
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.LevelCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameEn }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.NameAr }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.LevelOrder }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });
    }
}
