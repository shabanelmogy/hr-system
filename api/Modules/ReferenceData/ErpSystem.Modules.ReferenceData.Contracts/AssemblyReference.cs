using System.Reflection;

namespace ErpSystem.Modules.ReferenceData.Contracts;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}