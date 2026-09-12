namespace ErpSystem.Modules.HR.Presentation.Common.Observability;

public static class CorrelationContextExtensions
{
    public const string ItemKey = "HrManagementSystem.CorrelationId";

    public static string GetCorrelationId(this HttpContext context) =>
        context.Items.TryGetValue(ItemKey, out var value) && value is string correlationId
            ? correlationId
            : context.TraceIdentifier;
}
