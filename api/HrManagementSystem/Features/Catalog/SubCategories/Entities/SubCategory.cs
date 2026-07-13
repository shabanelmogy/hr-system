namespace HrManagementSystem.Features.Catalog.SubCategories.Entities
{
    public class SubCategory : AuditableEntity
    {
        public int Id { get; set; }
        public string NameAr { get; set; } = string.Empty;
        public string NameEn { get; set; } = string.Empty;
        public ICollection<CategorySubcategory> CategorySubcategories { get; set; } = [];
    }
}