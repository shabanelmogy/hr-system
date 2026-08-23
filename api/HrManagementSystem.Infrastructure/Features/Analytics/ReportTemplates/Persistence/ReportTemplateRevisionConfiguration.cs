using HrManagementSystem.Domain.Analytics.ReportTemplates.Entities;

namespace HrManagementSystem.Infrastructure.Features.Analytics.ReportTemplates.Persistence;

public sealed class ReportTemplateRevisionConfiguration
    : IEntityTypeConfiguration<ReportTemplateRevision>
{
    public void Configure(EntityTypeBuilder<ReportTemplateRevision> builder)
    {
        builder.HasKey(revision => revision.Id);
        builder.Property(revision => revision.Operation).IsRequired().HasMaxLength(32);
        builder.Property(revision => revision.Name).IsRequired().HasMaxLength(150);
        builder.Property(revision => revision.Description).HasMaxLength(500);
        builder.Property(revision => revision.DataSourceKey).IsRequired().HasMaxLength(64);
        builder.Property(revision => revision.DefinitionJson).IsRequired().HasColumnType("nvarchar(max)");
        builder.Property(revision => revision.ContentHash).IsRequired().HasMaxLength(64).IsFixedLength();
        builder.Property(revision => revision.IsPublished).IsRequired();
        builder.Property(revision => revision.IsArchived).IsRequired();

        builder.HasIndex(revision => new
        {
            revision.TenantId,
            revision.ReportTemplateId,
            revision.RevisionNumber
        }).IsUnique();
    }
}
