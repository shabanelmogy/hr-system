using HrManagementSystem.Domain.Security.ApiKeys.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.ApiKeys.Persistence;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        builder.HasKey(e => e.Id);

        builder.Property(e => e.KeyHash)
              .IsRequired()
              .HasMaxLength(64);

        builder.Property(e => e.KeyPrefix)
              .IsRequired()
              .HasMaxLength(16);

        builder.Property(e => e.ClientUri)
              .IsRequired()
              .HasMaxLength(100);

        builder.Property(e => e.Description)
              .IsRequired()
              .HasMaxLength(100);

        builder.Property(e => e.IsActive)
              .IsRequired()
              .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
              .IsRequired()
              .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(e => e.RevocationReason)
              .HasMaxLength(100);

        builder.HasIndex(e => e.KeyHash)
              .IsUnique();

        builder.HasIndex(e => e.ClientUri);
    }
}
