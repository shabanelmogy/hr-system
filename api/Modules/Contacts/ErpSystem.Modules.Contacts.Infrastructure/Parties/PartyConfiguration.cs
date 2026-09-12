using ErpSystem.Modules.Contacts.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Contacts.Infrastructure.Parties;

internal sealed class PartyConfiguration : IEntityTypeConfiguration<Party>
{
    public void Configure(EntityTypeBuilder<Party> builder)
    {
        builder.ToTable("Parties");
        builder.HasKey(party => party.Id);
        builder.Property(party => party.TenantId).HasMaxLength(128).IsRequired();
        builder.Property(party => party.DisplayName).HasMaxLength(256).IsRequired();
        builder.Property(party => party.Email).HasMaxLength(320);
        builder.Property(party => party.Phone).HasMaxLength(64);
        builder.Property(party => party.RowVersion).IsRowVersion();
        builder.HasIndex(party => new { party.TenantId, party.CompanyId, party.DisplayName });
    }
}
