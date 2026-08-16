using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class UserInvitationConfiguration : IEntityTypeConfiguration<UserInvitation>
{
    public void Configure(EntityTypeBuilder<UserInvitation> builder)
    {
        builder.ToTable("UserInvitations");
        builder.HasKey(invitation => invitation.Id);
        builder.Property(invitation => invitation.Email).HasMaxLength(256).IsRequired();
        builder.Property(invitation => invitation.NormalizedEmail).HasMaxLength(256).IsRequired();
        builder.Property(invitation => invitation.FirstName).HasMaxLength(50).IsRequired();
        builder.Property(invitation => invitation.LastName).HasMaxLength(50).IsRequired();
        builder.Property(invitation => invitation.UserName).HasMaxLength(50).IsRequired();
        builder.Property(invitation => invitation.NormalizedUserName).HasMaxLength(50).IsRequired();
        builder.Property(invitation => invitation.TokenHash).HasMaxLength(64).IsRequired();
        builder.Property(invitation => invitation.RolesJson).HasMaxLength(2000).IsRequired();
        builder.Property(invitation => invitation.CompanyIdsJson).HasMaxLength(1000).IsRequired();
        builder.Property(invitation => invitation.InvitedByUserId).HasMaxLength(450).IsRequired();
        builder.Property(invitation => invitation.Status).HasConversion<string>().HasMaxLength(16).IsRequired();
        builder.Property(invitation => invitation.RowVersion).IsRowVersion();
        builder.HasIndex(invitation => invitation.TokenHash).IsUnique();
        builder.HasIndex(invitation => new { invitation.TenantId, invitation.NormalizedEmail, invitation.Status });
        builder.HasIndex(invitation => new { invitation.TenantId, invitation.NormalizedUserName, invitation.Status });
        builder.HasOne<ApplicationUser>()
            .WithMany()
            .HasForeignKey(invitation => invitation.InvitedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
