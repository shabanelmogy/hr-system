namespace ErpSystem.Modules.HR.Application.Features.Security.Users.Contracts;

public sealed record UserChangedResponse(
    int Count,
    UserResponse? User,
    string Action);
