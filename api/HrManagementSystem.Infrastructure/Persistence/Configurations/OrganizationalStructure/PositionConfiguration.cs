using HrManagementSystem.Domain.OrganizationalStructure.Entities;

namespace HrManagementSystem.Infrastructure.Persistence.Configurations.OrganizationalStructure;

public sealed class PositionConfiguration : IEntityTypeConfiguration<Position>
{
    public void Configure(EntityTypeBuilder<Position> builder)
    {
        builder.ToTable("Positions");
        builder.Property(x => x.PositionCode).HasMaxLength(50).IsRequired();
        builder.HasIndex(x => new { x.TenantId, x.CompanyId, x.PositionCode }).IsUnique();
        builder.HasAlternateKey(x => new { x.TenantId, x.CompanyId, x.Id });

        builder.HasOne(x => x.JobTitle)
            .WithMany(x => x.Positions)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobTitleId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.Division)
            .WithMany(x => x.Positions)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.DivisionId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.JobLevel)
            .WithMany(x => x.Positions)
            .HasForeignKey(x => new { x.TenantId, x.CompanyId, x.JobLevelId })
            .HasPrincipalKey(x => new { x.TenantId, x.CompanyId, x.Id })
            .OnDelete(DeleteBehavior.Restrict);
    }
}
