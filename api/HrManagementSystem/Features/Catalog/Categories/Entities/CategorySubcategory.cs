using HrManagementSystem.Features.Catalog.SubCategories.Entities;

namespace HrManagementSystem.Features.Catalog.Categories.Entities
{
    public class CategorySubcategory
    {
        public int CategoryId { get; set; }
        public Category? Category { get; set; } // Navigation property

        public int SubCategoryId { get; set; }
        public SubCategory? SubCategory { get; set; } // Navigation property
    }
}
