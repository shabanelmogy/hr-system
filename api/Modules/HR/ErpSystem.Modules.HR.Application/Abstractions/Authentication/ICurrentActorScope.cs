using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Modules.HR.Application.Abstractions.Authentication;

/// <summary>Compatibility alias for the shared trusted execution scope.</summary>
public interface ICurrentActorScope : ICurrentExecutionContextScope
{
}
