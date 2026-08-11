using HrManagementSystem.Domain.Catalog.SubCategories.Entities;
using HrManagementSystem.Domain.Common.Abstractions;

namespace HrManagementSystem.Domain.Catalog.Categories.Entities
{
    public class CategorySubcategory : ICompanyScoped
    {
        public string TenantId { get; set; } = string.Empty;
        public int CompanyId { get; set; }
        public int CategoryId { get; set; }
        public Category? Category { get; set; } // Navigation property

        public int SubCategoryId { get; set; }
        public SubCategory? SubCategory { get; set; } // Navigation property
    }
}
