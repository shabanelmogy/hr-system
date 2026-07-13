namespace HrManagementSystem.Features.GeographicalInformation.States.Contracts;

public record StatesCountResponse(
    int Count,
    StateResponse? State,
    string? Action
);
