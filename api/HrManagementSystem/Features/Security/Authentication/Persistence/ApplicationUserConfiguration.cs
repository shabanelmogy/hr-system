namespace HrManagementSystem.Features.Security.Authentication.Persistence;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(x => x.FirstName).HasMaxLength(100);
        builder.Property(x => x.LastName).HasMaxLength(100);

        builder.OwnsMany(x => x.RefreshTokens, token =>
        {
            token.Property(x => x.TokenHash).HasMaxLength(64).IsRequired();
            token.Property(x => x.SessionId).HasMaxLength(32).IsRequired();
            token.Property(x => x.JwtId).HasMaxLength(36).IsRequired();
            token.Property(x => x.ReplacedByTokenHash).HasMaxLength(64);
            token.Property(x => x.RevocationReason).HasMaxLength(100);
            token.Property(x => x.CreatedByIp).HasMaxLength(45);
            token.Property(x => x.CreatedByUserAgent).HasMaxLength(256);
            token.HasIndex(x => x.TokenHash).IsUnique();
            token.HasIndex(x => x.SessionId);
        });
    }
}
