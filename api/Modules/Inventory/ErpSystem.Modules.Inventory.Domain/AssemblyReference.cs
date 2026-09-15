using System.Reflection;

namespace ErpSystem.Modules.Inventory.Domain;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}