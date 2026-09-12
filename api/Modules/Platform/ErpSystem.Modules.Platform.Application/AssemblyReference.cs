using System.Reflection;

namespace ErpSystem.Modules.Platform.Application;

public static class AssemblyReference
{
    public static readonly Assembly Assembly = typeof(AssemblyReference).Assembly;
}