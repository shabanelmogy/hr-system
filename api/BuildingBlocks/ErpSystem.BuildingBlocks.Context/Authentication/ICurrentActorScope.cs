using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.BuildingBlocks.Context.Authentication;

/// <summary>Trusted request scope used by authentication and background work.</summary>
public interface ICurrentActorScope : ICurrentExecutionContextScope
{
}
