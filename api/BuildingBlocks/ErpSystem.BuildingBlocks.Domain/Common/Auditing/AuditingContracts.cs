namespace ErpSystem.BuildingBlocks.Domain.Auditing;

/// <summary>
/// Marks an entity whose inserts, updates, deletes and restores are recorded in the
/// owning module's audit trail automatically. <see cref="Entities.AuditableEntity"/>
/// implements it, so every business entity is audited without feature code.
/// </summary>
public interface IAuditedEntity
{
}

/// <summary>
/// Excludes an entity type or a single property from the automatic audit trail.
/// Use it for machine-generated rows (raw device data, history tables) and for
/// values that must never be copied into the trail.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property, Inherited = true, AllowMultiple = false)]
public sealed class AuditIgnoreAttribute : Attribute
{
}
