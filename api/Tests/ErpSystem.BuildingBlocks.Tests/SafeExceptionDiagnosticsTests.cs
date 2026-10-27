using System.Data.Common;
using ErpSystem.BuildingBlocks.Application.Diagnostics;

namespace ErpSystem.BuildingBlocks.Tests;

public sealed class SafeExceptionDiagnosticsTests
{
    [Fact]
    public void Captures_nested_types_codes_and_frames_without_private_content()
    {
        Exception inner;
        try { throw new TestDatabaseException("Password=private-secret; SELECT private-data"); }
        catch (Exception exception) { inner = exception; }
        var outer = new InvalidOperationException("Bearer private-token", inner);
        var lines = SafeExceptionDiagnostics.Capture(outer);
        var text = string.Join("\n", lines);
        Assert.Contains("System.InvalidOperationException", text);
        Assert.Contains("TestDatabaseException", text);
        Assert.Contains("HResult:", text);
        Assert.Contains("ProviderErrorCode:", text);
        Assert.Contains(".Frame[", text);
        Assert.DoesNotContain("private-secret", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("private-data", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("private-token", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain(".cs", text, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("Bearer", text, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Includes_aggregate_branches_and_bounds_node_count()
    {
        var exceptions = Enumerable.Range(0, 20).Select(_ => new ArgumentException("secret")).ToArray();
        var lines = SafeExceptionDiagnostics.Capture(new AggregateException(exceptions));
        Assert.Equal(8, lines.Count(line => line.Contains(".Type:", StringComparison.Ordinal)));
        Assert.Contains("DiagnosticsTruncated: ExceptionLimit", lines);
        Assert.DoesNotContain(lines, line => line.Contains("secret", StringComparison.Ordinal));
    }

    [Fact]
    public void Null_exception_has_no_structural_frames() => Assert.Empty(SafeExceptionDiagnostics.Capture(null));

    private sealed class TestDatabaseException(string message) : DbException(message);
}
