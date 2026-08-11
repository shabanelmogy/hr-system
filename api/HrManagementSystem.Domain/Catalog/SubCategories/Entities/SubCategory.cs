using HrManagementSystem.Domain.Catalog.Categories.Entities;

namespace HrManagementSystem.Domain.Catalog.SubCategories.Entities
{
    public class SubCategory : CompanyAuditableEntity
    {
        public int Id { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public ICollection<CategorySubcategory> CategorySubcategories { get; set; } = [];
    }
}
