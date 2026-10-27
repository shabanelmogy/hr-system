using System.Data.Common;
using System.Diagnostics;
using System.Globalization;

namespace ErpSystem.BuildingBlocks.Application.Diagnostics;

/// <summary>Bounded structural diagnostics. Never reads messages, Data, SQL text or file paths.</summary>
public static class SafeExceptionDiagnostics
{
    public static IReadOnlyList<string> Capture(Exception? exception)
    {
        if (exception is null) return [];
        var lines = new List<string>();
        var pending = new Queue<Exception>();
        var seen = new HashSet<Exception>(ReferenceEqualityComparer.Instance);
        pending.Enqueue(exception);
        var node = 0;
        var frameCount = 0;
        while (pending.Count > 0 && node < 8)
        {
            var current = pending.Dequeue();
            if (!seen.Add(current)) continue;
            var prefix = $"Exception[{node}]";
            lines.Add($"{prefix}.Type: {current.GetType().FullName}");
            lines.Add($"{prefix}.HResult: 0x{current.HResult:X8}");
            if (current is DbException database)
            {
                lines.Add($"{prefix}.ProviderErrorCode: {database.ErrorCode}");
                // Only known SQL providers expose these numeric diagnostics. Never read arbitrary property values.
                if (current.GetType().FullName is "Microsoft.Data.SqlClient.SqlException" or "System.Data.SqlClient.SqlException")
                {
                    foreach (var name in new[] { "Number", "State", "Class", "LineNumber" })
                    {
                        try
                        {
                            var value = current.GetType().GetProperty(name)?.GetValue(current);
                            if (value is int or byte or short)
                                lines.Add($"{prefix}.Sql{name}: {Convert.ToString(value, CultureInfo.InvariantCulture)}");
                            if (name == "Number" && value is int number && SqlCause(number) is { } cause)
                                lines.Add($"{prefix}.SqlCause: {cause}");
                        }
                        catch { /* A diagnostic accessor never becomes an application dependency. */ }
                    }
                }
            }
            foreach (var frame in new StackTrace(current, true).GetFrames())
            {
                if (frameCount >= 64) break;
                var method = frame.GetMethod();
                if (method?.DeclaringType is null) continue;
                var line = frame.GetFileLineNumber();
                lines.Add($"{prefix}.Frame[{frameCount}]: {method.DeclaringType.FullName}.{method.Name}" +
                    (line > 0 ? $" Line:{line}" : "") + $" IL:{frame.GetILOffset()}");
                frameCount++;
            }
            if (current is AggregateException aggregate)
                foreach (var inner in aggregate.InnerExceptions.Take(8)) pending.Enqueue(inner);
            else if (current.InnerException is { } inner) pending.Enqueue(inner);
            node++;
        }
        if (pending.Count > 0) lines.Add("DiagnosticsTruncated: ExceptionLimit");
        if (frameCount >= 64) lines.Add("DiagnosticsTruncated: FrameLimit");
        return lines;
    }

    private static string? SqlCause(int number) => number switch
    {
        207 => "InvalidColumn", 208 => "InvalidObject", 547 => "ConstraintConflict",
        2601 or 2627 => "DuplicateKey", 1205 => "Deadlock", -2 => "Timeout",
        18456 => "AuthenticationFailed", 4060 => "DatabaseUnavailable", _ => null
    };
}
