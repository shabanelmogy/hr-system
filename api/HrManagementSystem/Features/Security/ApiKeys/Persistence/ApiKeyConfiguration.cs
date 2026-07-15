using HrManagementSystem.Features.Security.ApiKeys.Entities;

namespace HrManagementSystem.Features.Security.ApiKeys.Persistence;

public class ApiKeyConfiguration : IEntityTypeConfiguration<ApiKey>
{
    public void Configure(EntityTypeBuilder<ApiKey> builder)
    {
        ;
        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.Key)
              .IsRequired()
              .HasMaxLength(100);

        builder.Property(e => e.ClientUri)
              .IsRequired()
              .HasMaxLength(100);

        builder.Property(e => e.Description)
              .HasMaxLength(100);

        builder.Property(e => e.IsActive)
              .IsRequired()
              .HasDefaultValue(true);

        builder.Property(e => e.CreatedAt)
              .IsRequired()
              .HasDefaultValueSql("GETUTCDATE()");

        // Indexes
        builder.HasIndex(e => e.Key)
              .IsUnique();

        builder.HasIndex(e => e.ClientUri);
    }
}
