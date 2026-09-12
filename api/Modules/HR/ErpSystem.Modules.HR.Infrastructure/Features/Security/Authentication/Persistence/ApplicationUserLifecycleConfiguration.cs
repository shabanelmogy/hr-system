using ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Entities;
using ErpSystem.Modules.HR.Domain.Security.Users.Enums;

namespace ErpSystem.Modules.HR.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class ApplicationUserLifecycleConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(user => user.LifecycleStatus)
            .HasConversion<string>()
            .HasMaxLength(32)
            .HasDefaultValue(UserLifecycleStatus.Active)
            .IsRequired();
        builder.Property(user => user.ArchiveReason).HasMaxLength(1000);
        builder.HasIndex(user => new { user.TenantId, user.LifecycleStatus });
    }
}
