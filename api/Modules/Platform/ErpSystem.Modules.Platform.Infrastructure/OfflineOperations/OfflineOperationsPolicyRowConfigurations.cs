using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Platform.Infrastructure.OfflineOperations;

internal sealed class OfflineOperationsPolicyRowConfiguration
    : IEntityTypeConfiguration<OfflineOperationsPolicyRow>
{
    public void Configure(EntityTypeBuilder<OfflineOperationsPolicyRow> builder)
    {
        builder.ToTable("OfflineOperationsPolicies", PlatformDbContext.Schema);
        builder.HasKey(row => row.Id);
        builder.Property(row => row.TenantId).HasMaxLength(450).IsRequired();
        builder.Property(row => row.CompanyId).IsRequired();
        builder.Property(row => row.ModesJson).IsRequired();
        builder.Property(row => row.UpdatedOn).IsRequired();
        builder.Property(row => row.UpdatedByUserId).HasMaxLength(450).IsRequired();
        builder.Property(row => row.RowVersion).IsRowVersion();
        builder.HasIndex(row => new { row.TenantId, row.CompanyId }).IsUnique();
    }
}

internal sealed class OfflineOperationsPolicyHistoryRowConfiguration
    : IEntityTypeConfiguration<OfflineOperationsPolicyHistoryRow>
{
    public void Configure(EntityTypeBuilder<OfflineOperationsPolicyHistoryRow> builder)
    {
        builder.ToTable("OfflineOperationsPolicyHistory", PlatformDbContext.Schema);
        builder.HasKey(row => row.Id);
        builder.Property(row => row.TenantId).HasMaxLength(450).IsRequired();
        builder.Property(row => row.CompanyId).IsRequired();
        builder.Property(row => row.NewModesJson).IsRequired();
        builder.Property(row => row.ChangedOn).IsRequired();
        builder.Property(row => row.ChangedByUserId).HasMaxLength(450).IsRequired();
        builder.HasIndex(row => new { row.TenantId, row.CompanyId, row.ChangedOn });
        builder.HasOne<OfflineOperationsPolicyRow>()
            .WithMany()
            .HasForeignKey(row => row.PolicyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
