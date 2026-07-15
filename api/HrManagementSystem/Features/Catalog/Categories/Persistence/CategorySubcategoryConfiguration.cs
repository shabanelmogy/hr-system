using HrManagementSystem.Features.Catalog.Categories.Entities;

namespace HrManagementSystem.Features.Catalog.Categories.Persistence;

public class CategorySubcategoryConfiguration : IEntityTypeConfiguration<CategorySubcategory>
{
    public void Configure(EntityTypeBuilder<CategorySubcategory> builder)
    {
        builder.ToTable("CategorySubcategories");

        builder.HasKey(cs => new { cs.CategoryId, cs.SubCategoryId });

        builder.HasOne(cs => cs.Category)
               .WithMany(c => c.CategorySubcategories)
               .HasForeignKey(cs => cs.CategoryId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cs => cs.SubCategory)
               .WithMany(s => s.CategorySubcategories)
               .HasForeignKey(cs => cs.SubCategoryId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(cs => cs.CategoryId);
        builder.HasIndex(cs => cs.SubCategoryId);
    }
}
