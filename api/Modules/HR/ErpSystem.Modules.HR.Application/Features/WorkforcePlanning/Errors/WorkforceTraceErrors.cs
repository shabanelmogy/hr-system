using ErpSystem.Modules.HR.Application.Common.Errors;

namespace ErpSystem.Modules.HR.Application.Features.WorkforcePlanning.Errors;

public static class WorkforceTraceErrors
{
    public static readonly Error TraceNotFound = new(
        "WorkforcePlanning.TraceNotFound",
        "The requested hiring trace was not found.",
        ErrorType.NotFound);
}

