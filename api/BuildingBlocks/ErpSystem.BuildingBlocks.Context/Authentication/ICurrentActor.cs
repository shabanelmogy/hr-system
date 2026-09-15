using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.BuildingBlocks.Context.Authentication;

/// <summary>
/// Request actor context exposed to module application and infrastructure code.
/// The host supplies the trusted execution context implementation.
/// </summary>
public interface ICurrentActor : ICurrentExecutionContext
{
}
