namespace ErpSystem.Modules.Platform.Application.Features.Platform.ErrorLogs;

public static class ErrorLogCriteriaPolicy
{
    public static bool IsValid(ErrorLogCriteria criteria) =>
        criteria.Page is >= 1 and <= 100000 &&
        criteria.PageSize is >= 1 and <= 100 &&
        (criteria.Search?.Length ?? 0) <= 120 &&
        (criteria.UserName?.Length ?? 0) <= 100 &&
        criteria.Source is null or "api" or "job" or "web" or "mobile" &&
        criteria.StatusCode is null or >= 400 and <= 599 &&
        (!criteria.FromUtc.HasValue || criteria.FromUtc.Value.Kind == DateTimeKind.Utc) &&
        (!criteria.ToUtc.HasValue || criteria.ToUtc.Value.Kind == DateTimeKind.Utc) &&
        (!criteria.FromUtc.HasValue || !criteria.ToUtc.HasValue || criteria.FromUtc <= criteria.ToUtc);
}
