using Microsoft.EntityFrameworkCore;

namespace ErpSystem.BuildingBlocks.Persistence.AuditTrail;

public static class AuditTrailModelBuilderExtensions
{
    public const int TenantIdMaxLength = 64;
    public const int EntityNameMaxLength = 200;
    public const int EntityKeyMaxLength = 200;
    public const int EntityDisplayMaxLength = 400;
    public const int UserIdMaxLength = 450;
    public const int CorrelationIdMaxLength = 100;

    /// <summary>
    /// Maps <see cref="AuditTrailEntry"/> into the calling module's default schema.
    /// Call it from every module DbContext's OnModelCreating after HasDefaultSchema.
    /// </summary>
    public static ModelBuilder ApplyAuditTrail(this ModelBuilder modelBuilder)
    {
        ArgumentNullException.ThrowIfNull(modelBuilder);

        modelBuilder.Entity<AuditTrailEntry>(builder =>
        {
            builder.ToTable(AuditTrailEntry.TableName);
            builder.HasKey(entry => entry.Id);
            builder.Property(entry => entry.TenantId).HasMaxLength(TenantIdMaxLength);
            builder.Property(entry => entry.EntityName).HasMaxLength(EntityNameMaxLength).IsRequired();
            builder.Property(entry => entry.EntityKey).HasMaxLength(EntityKeyMaxLength).IsRequired();
            builder.Property(entry => entry.EntityDisplay).HasMaxLength(EntityDisplayMaxLength);
            builder.Property(entry => entry.Action).HasConversion<byte>();
            builder.Property(entry => entry.UserId).HasMaxLength(UserIdMaxLength);
            builder.Property(entry => entry.CorrelationId).HasMaxLength(CorrelationIdMaxLength);
            builder.Property(entry => entry.ChangesJson).IsRequired();
            builder.HasIndex(entry => new { entry.TenantId, entry.OccurredOnUtc, entry.Id })
                .IsDescending(false, true, true);
            builder.HasIndex(entry => new { entry.TenantId, entry.EntityName, entry.EntityKey });
        });

        return modelBuilder;
    }
}
