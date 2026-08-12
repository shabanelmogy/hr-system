namespace HrManagementSystem.Application.Features.Security.Users.Contracts;

public sealed record UserCompanyOptionResponse(
    int Id,
    string NameAr,
    string NameEn,
    bool IsActive);
