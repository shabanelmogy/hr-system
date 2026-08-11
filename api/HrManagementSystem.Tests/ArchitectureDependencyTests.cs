using System.Reflection;

namespace HrManagementSystem.Tests;

public sealed class ArchitectureDependencyTests
{
    [Fact]
    public void Domain_DoesNotReferenceOuterLayers()
    {
        var references = ReferencedAssemblies(typeof(Domain.AssemblyReference).Assembly);

        Assert.DoesNotContain("HrManagementSystem.Application", references);
        Assert.DoesNotContain("HrManagementSystem.Infrastructure", references);
        Assert.DoesNotContain("HrManagementSystem.Api", references);
        Assert.DoesNotContain("System.ComponentModel.Annotations", references);
    }

    [Fact]
    public void Application_DoesNotReferenceOuterLayersOrWebPersistenceFrameworks()
    {
        var references = ReferencedAssemblies(typeof(Application.AssemblyReference).Assembly);

        Assert.DoesNotContain("HrManagementSystem.Infrastructure", references);
        Assert.DoesNotContain("HrManagementSystem.Api", references);
        Assert.DoesNotContain("Microsoft.AspNetCore.Http.Abstractions", references);
        Assert.DoesNotContain("Microsoft.AspNetCore.Mvc.Core", references);
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore", references);
    }

    [Fact]
    public void Infrastructure_DoesNotReferenceApi()
    {
        var references = ReferencedAssemblies(typeof(Infrastructure.AssemblyReference).Assembly);

        Assert.DoesNotContain("HrManagementSystem.Api", references);
    }

    private static HashSet<string> ReferencedAssemblies(Assembly assembly) =>
        assembly.GetReferencedAssemblies()
            .Select(reference => reference.Name)
            .OfType<string>()
            .ToHashSet(StringComparer.Ordinal);
}
