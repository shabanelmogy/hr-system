using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ErpSystem.Modules.Accounting.Infrastructure.Parties;

internal sealed class AccountingPartyReferenceConfiguration : IEntityTypeConfiguration<AccountingPartyReference>
{
    public void Configure(EntityTypeBuilder<AccountingPartyReference> builder)
    {
        builder.ToTable("PartyReferences");
        builder.HasKey(reference => new { reference.TenantId, reference.CompanyId, reference.PartyId });
        builder.Property(reference => reference.TenantId).HasMaxLength(128).IsRequired();
        builder.Property(reference => reference.DisplayName).HasMaxLength(256).IsRequired();
        builder.Property(reference => reference.Email).HasMaxLength(320);
        builder.Property(reference => reference.Phone).HasMaxLength(64);
        builder.Property(reference => reference.RowVersion).IsRowVersion();
        builder.HasIndex(reference => reference.PartyId);
    }
}
