using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class JobTitleConfiguration : IEntityTypeConfiguration<JobTitle>
{
    public void Configure(EntityTypeBuilder<JobTitle> builder)
    {
        builder.ToTable("JobTitles");
        builder.Property(x => x.JobTitleCode).HasMaxLength(50).IsRequired();
        builder.Property(x => x.TitleEn).HasMaxLength(200).IsRequired();
        builder.Property(x => x.TitleAr).HasMaxLength(200).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.JobTitleCode }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.TitleEn }).IsUnique();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.TitleAr }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });
    }
}
