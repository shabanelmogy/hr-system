namespace ErpSystem.BuildingBlocks.Application.Common.Errors;

public enum ErrorType
{
    None = 0,
    Validation,
    Unauthorized,
    Forbidden,
    NotFound,
    Conflict,
    PayloadTooLarge,
    Unexpected,
    ServiceUnavailable
}
