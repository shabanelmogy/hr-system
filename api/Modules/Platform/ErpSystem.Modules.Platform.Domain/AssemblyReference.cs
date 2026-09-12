using System.Reflection;

namespace ErpSystem.Modules.Platform.Domain;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}