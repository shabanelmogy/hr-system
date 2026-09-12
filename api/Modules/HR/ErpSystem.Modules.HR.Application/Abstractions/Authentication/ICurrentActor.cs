using ErpSystem.BuildingBlocks.Context;

namespace ErpSystem.Modules.HR.Application.Abstractions.Authentication;

/// <summary>
/// HR compatibility alias for the shared execution context. New cross-module
/// code should depend on <see cref="ICurrentExecutionContext"/> directly.
/// </summary>
public interface ICurrentActor : ICurrentExecutionContext
{
}
