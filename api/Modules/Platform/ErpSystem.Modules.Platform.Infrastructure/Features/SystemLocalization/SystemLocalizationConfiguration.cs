using ErpSystem.Modules.Platform.Domain.Platform.Localization;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace ErpSystem.Modules.Platform.Infrastructure.Features.SystemLocalization;
public sealed class SystemLocalizationConfiguration : IEntityTypeConfiguration<SystemLocalizationSettings>
{
 public void Configure(EntityTypeBuilder<SystemLocalizationSettings> b) {
  b.ToTable("SystemLocalizationSettings", PlatformDbContext.Schema, table => table.HasCheckConstraint("CK_SystemLocalizationSettings_Singleton", "[Id] = 1"));
  b.HasKey(x=>x.Id); b.Property(x=>x.Id).ValueGeneratedNever(); b.Property(x=>x.Revision).IsConcurrencyToken(); b.Property(x=>x.RowVersion).IsRowVersion();
  b.OwnsMany(x=>x.Overrides, o=>{o.ToTable("SystemLocalizationOverrides",PlatformDbContext.Schema);o.WithOwner().HasForeignKey("SettingsId");o.Property<int>("Id").ValueGeneratedOnAdd();o.HasKey("Id");o.Property(x=>x.Source).HasMaxLength(100).IsRequired();o.Property(x=>x.Language).HasMaxLength(2).IsRequired();o.Property(x=>x.Key).HasMaxLength(400).IsRequired();o.Property(x=>x.Value).HasMaxLength(4000).IsRequired();o.HasIndex("SettingsId",nameof(SystemLocalizationOverride.Source),nameof(SystemLocalizationOverride.Language),nameof(SystemLocalizationOverride.Key)).IsUnique();});
 }
}
