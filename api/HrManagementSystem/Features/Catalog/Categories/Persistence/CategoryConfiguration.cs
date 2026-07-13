namespace HrManagementSystem.Features.Catalog.Categories.Persistence;

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.HasIndex(x => x.NameAr).IsUnique();
        builder.Property(x => x.NameAr).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
                tb.HasCheckConstraint("CHK_Category_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS"));

        builder.HasIndex(x => x.NameEn).IsUnique();
        builder.Property(x => x.NameEn).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
               tb.HasCheckConstraint("CHK_Category_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'"));

        builder.HasMany(c => c.CategorySubcategories)
               .WithOne(cs => cs.Category)
               .HasForeignKey(cs => cs.CategoryId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}