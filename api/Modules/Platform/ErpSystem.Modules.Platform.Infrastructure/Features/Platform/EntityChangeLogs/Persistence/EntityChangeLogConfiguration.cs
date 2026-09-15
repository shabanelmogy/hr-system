using ErpSystem.Modules.Platform.Domain.Platform.EntityChangeLogs.Entities;

namespace ErpSystem.Modules.Platform.Infrastructure.Features.Platform.EntityChangeLogs.Persistence;

public sealed class EntityChangeLogConfiguration : IEntityTypeConfiguration<EntityChangeLog>
{
    public void Configure(EntityTypeBuilder<EntityChangeLog> builder)
    {
        builder.Property(change => change.EntityKey).HasMaxLength(450);
    }
}
