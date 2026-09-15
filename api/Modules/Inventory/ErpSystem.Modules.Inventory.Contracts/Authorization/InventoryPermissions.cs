namespace ErpSystem.Modules.Inventory.Contracts.Authorization;

public static class InventoryPermissions
{
    public const string ViewCategories = "Categories:View";
    public const string CreateCategories = "Categories:Create";
    public const string EditCategories = "Categories:Edit";
    public const string DeleteCategories = "Categories:Delete";

    public const string ViewSubCategories = "SubCategories:View";
    public const string CreateSubCategories = "SubCategories:Create";
    public const string EditSubCategories = "SubCategories:Edit";
    public const string DeleteSubCategories = "SubCategories:Delete";

    public static IReadOnlyList<string> Catalog { get; } =
    [
        ViewCategories, CreateCategories, EditCategories, DeleteCategories,
        ViewSubCategories, CreateSubCategories, EditSubCategories, DeleteSubCategories
    ];

    public static IReadOnlyList<string> All => Catalog;
}