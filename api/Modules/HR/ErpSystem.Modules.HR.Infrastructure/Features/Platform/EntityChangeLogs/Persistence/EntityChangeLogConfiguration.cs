using ErpSystem.Modules.HR.Domain.Platform.EntityChangeLogs.Entities;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;

public sealed class EntityChangeLogConfiguration : IEntityTypeConfiguration<EntityChangeLog>
{
    public void Configure(EntityTypeBuilder<EntityChangeLog> builder)
    {
        builder.Property(change => change.EntityKey).HasMaxLength(450);
    }
}
