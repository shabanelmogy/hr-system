using HrManagementSystem.Infrastructure.Features.Security.Authentication.Entities;

namespace HrManagementSystem.Infrastructure.Features.Security.Authentication.Persistence;

public sealed class AuthenticationSelectionChallengeConfiguration :
    IEntityTypeConfiguration<AuthenticationSelectionChallenge>
{
    public void Configure(EntityTypeBuilder<AuthenticationSelectionChallenge> builder)
    {
        builder.ToTable("AuthenticationSelectionChallenges");
        builder.HasKey(challenge => challenge.JwtId);
        builder.Property(challenge => challenge.JwtId).HasMaxLength(32);
        builder.Property(challenge => challenge.UserId).HasMaxLength(450).IsRequired();
        builder.Property(challenge => challenge.Scope).HasMaxLength(32).IsRequired();
        builder.Property(challenge => challenge.TenantId).HasMaxLength(32);
        builder.Property(challenge => challenge.RowVersion).IsRowVersion();
        builder.HasIndex(challenge => challenge.ExpiresOn);
        builder.HasIndex(challenge => new { challenge.UserId, challenge.Scope });

        builder.HasOne(challenge => challenge.User)
            .WithMany()
            .HasForeignKey(challenge => challenge.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
