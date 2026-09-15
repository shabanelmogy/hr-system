namespace ErpSystem.Modules.Platform.Application.Features.Security.Users.Contracts;

public sealed record UserChangedResponse(
    int Count,
    UserResponse? User,
    string Action);
