using HrManagementSystem.Application.Common.Errors;

namespace HrManagementSystem.Application.Features.WorkforcePlanning.Errors;

public static class WorkforceTraceErrors
{
    public static readonly Error TraceNotFound = new(
        "WorkforcePlanning.TraceNotFound",
        "The requested hiring trace was not found.",
        ErrorType.NotFound);
}

