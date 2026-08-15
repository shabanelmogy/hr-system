using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class UserTenantAccessConfiguration : IEntityTypeConfiguration<UserTenantAccess>
{
    public void Configure(EntityTypeBuilder<UserTenantAccess> builder)
    {
        builder.ToTable("UserTenantAccesses");
        builder.HasKey(access => new { access.UserId, access.TenantId });

        builder.HasOne(access => access.User)
            .WithMany(user => user.TenantAccesses)
            .HasForeignKey(access => access.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(access => access.Tenant)
            .WithMany()
            .HasForeignKey(access => access.TenantId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(access => new { access.TenantId, access.IsDefault });
    }
}
