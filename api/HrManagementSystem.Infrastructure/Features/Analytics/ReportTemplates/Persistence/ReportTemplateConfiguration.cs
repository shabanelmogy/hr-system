using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

namespace HrManagementSystem.Infrastructure.Features.Analytics.ReportTemplates.Persistence;

public sealed class ReportTemplateConfiguration : IEntityTypeConfiguration<ReportTemplate>
{
    public void Configure(EntityTypeBuilder<ReportTemplate> builder)
    {
        builder.HasKey(template => template.Id);
        builder.Property(template => template.FeatureKey).IsRequired().HasMaxLength(64);
        builder.Property(template => template.Name).IsRequired().HasMaxLength(150);
        builder.Property(template => template.Description).HasMaxLength(500);
        builder.Property(template => template.DataSourceKey).IsRequired().HasMaxLength(64);
        builder.Property(template => template.DefinitionJson).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(template => template.ContentHash).IsRequired().HasMaxLength(64).IsFixedLength();
        builder.Property(template => template.RevisionNumber).IsRequired();
        builder.Property(template => template.IsPublished).IsRequired();

        builder.HasIndex(template => new { template.TenantId, template.FeatureKey, template.Name })
            .IsUnique();
        builder.HasIndex(template => new
        {
            template.TenantId,
            template.FeatureKey,
            template.IsDeleted,
            template.IsPublished,
            template.Name
        });

        builder.HasMany(template => template.Revisions)
            .WithOne(revision => revision.ReportTemplate)
            .HasForeignKey(revision => revision.ReportTemplateId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
