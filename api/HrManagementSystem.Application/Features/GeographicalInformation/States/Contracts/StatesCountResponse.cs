namespace HrManagementSystem.Application.Features.GeographicalInformation.States.Contracts;

public record StatesCountResponse(
    int Count,
    StateResponse? State,
    string? Action
);
