using System.Reflection;

namespace ErpSystem.Modules.Platform.Presentation;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}