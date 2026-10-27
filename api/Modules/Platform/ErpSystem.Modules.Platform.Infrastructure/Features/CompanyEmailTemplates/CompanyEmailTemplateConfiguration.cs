using ErpSystem.Modules.Platform.Domain.Companies.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.CompanyEmailTemplates;

public sealed class CompanyEmailTemplateConfiguration : IEntityTypeConfiguration<CompanyEmailTemplateSettings>
{
    public void Configure(EntityTypeBuilder<CompanyEmailTemplateSettings> builder)
    {
        builder.ToTable("CompanyEmailTemplateSettings", PlatformDbContext.Schema);
        builder.HasKey(item => item.Id);
        builder.Property(item => item.TenantId).HasMaxLength(32).IsRequired();
        builder.HasIndex(item => new { item.TenantId, item.CompanyId }).IsUnique();
        builder.Property(item => item.Revision).IsConcurrencyToken();
        builder.Property(item => item.RowVersion).IsRowVersion();
        builder.OwnsMany(item => item.Templates, child =>
        {
            child.ToTable("CompanyEmailTemplateOverrides", PlatformDbContext.Schema);
            child.WithOwner().HasForeignKey("SettingsId");
            child.Property(item => item.Id).ValueGeneratedOnAdd(); child.HasKey(item => item.Id);
            child.Property(item => item.TemplateId).HasMaxLength(80).IsRequired();
            child.Property(item => item.Language).HasMaxLength(2).IsRequired();
            child.Property(item => item.Subject).HasMaxLength(200).IsRequired();
            child.Property(item => item.Body).HasMaxLength(50000).IsRequired();
            child.HasIndex("SettingsId", nameof(CompanyEmailTemplateOverride.TemplateId), nameof(CompanyEmailTemplateOverride.Language)).IsUnique();
        });
    }
}
