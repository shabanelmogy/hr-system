namespace HrManagementSystem.Features.Catalog.SubCategories.Persistence;

public class SubcategoryConfiguration : IEntityTypeConfiguration<SubCategory>
{
    public void Configure(EntityTypeBuilder<SubCategory> builder)
    {
        builder.HasIndex(x => x.NameAr).IsUnique();
        builder.Property(x => x.NameAr).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
               tb.HasCheckConstraint("CHK_SubCategory_NameAr_ArabicOnly", "[NameAr] NOT LIKE N'%[^�-� ]%' COLLATE Arabic_CI_AS"));

        builder.HasIndex(x => x.NameEn).IsUnique();
        builder.Property(x => x.NameEn).HasMaxLength(100).IsRequired();
        builder.ToTable(tb =>
               tb.HasCheckConstraint("CHK_SubCategory_NameEn_EnglishOnly", "[NameEn] NOT LIKE '%[^A-Za-z ]%'"));

        // Many-to-many relationship
        builder.HasMany(s => s.CategorySubcategories)
               .WithOne(cs => cs.SubCategory)
               .HasForeignKey(cs => cs.SubCategoryId)
               .OnDelete(DeleteBehavior.Restrict); // Prevent cascading delete
    }
}