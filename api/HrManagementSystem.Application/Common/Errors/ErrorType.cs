namespace HrManagementSystem.Application.Common.Errors;

public enum ErrorType
{
    None = 0,
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    Unexpected,
    ServiceUnavailable
}
