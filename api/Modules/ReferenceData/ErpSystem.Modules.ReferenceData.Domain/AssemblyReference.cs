using System.Reflection;

namespace ErpSystem.Modules.ReferenceData.Domain;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}