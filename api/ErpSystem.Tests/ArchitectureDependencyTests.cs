using System.Reflection;
using ErpSystem.BuildingBlocks.Application;

namespace ErpSystem.Tests;

public sealed class ArchitectureDependencyTests
{
    [Fact]
    public void Domain_DoesNotReferenceOuterLayers()
    {
        var references = ReferencedAssemblies(typeof(ErpSystem.Modules.HR.Domain.AssemblyReference).Assembly);

        Assert.DoesNotContain("ErpSystem.Modules.HR.Application", references);
        Assert.DoesNotContain("ErpSystem.Modules.HR.Infrastructure", references);
        Assert.DoesNotContain("ErpSystem.Api", references);
        Assert.DoesNotContain("System.ComponentModel.Annotations", references);
    }

    [Fact]
    public void Application_DoesNotReferenceOuterLayersOrWebPersistenceFrameworks()
    {
        var references = ReferencedAssemblies(typeof(ErpSystem.Modules.HR.Application.AssemblyReference).Assembly);

        Assert.DoesNotContain("ErpSystem.Modules.HR.Infrastructure", references);
        Assert.DoesNotContain("ErpSystem.Api", references);
        Assert.DoesNotContain("Microsoft.AspNetCore.Http.Abstractions", references);
        Assert.DoesNotContain("Microsoft.AspNetCore.Mvc.Core", references);
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore", references);
    }

    [Fact]
    public void Infrastructure_DoesNotReferenceApi()
    {
        var references = ReferencedAssemblies(typeof(ErpSystem.Modules.HR.Infrastructure.AssemblyReference).Assembly);

        Assert.DoesNotContain("ErpSystem.Api", references);
    }

    [Fact]
    public void SharedApplicationPipeline_DoesNotReferenceWebPersistenceOrModules()
    {
        var references = ReferencedAssemblies(typeof(RequestLoggingBehavior<,>).Assembly);

        Assert.DoesNotContain(references, name => name.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore", references);
        Assert.DoesNotContain(references, name => name.StartsWith("ErpSystem.Modules.", StringComparison.Ordinal));
    }

    private static HashSet<string> ReferencedAssemblies(Assembly assembly) =>
        assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .OfType<string>()
            .ToHashSet(StringComparer.Ordinal);
}
