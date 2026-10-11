using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;

namespace ErpSystem.Modules.Platform.Application.Abstractions.Persistence;

/// <summary>
/// Unit of work owned by the Platform module.
///
/// Every module shares one service container, so a plain <see cref="IUnitOfWork"/>
/// registration is replaced by the last module that registers one. Handlers in this
/// module must depend on this contract so their changes are saved by this module's
/// DbContext (the shared registration once saved them through another module's
/// context, dropping the changes while still returning success).
/// </summary>
public interface IPlatformUnitOfWork : IUnitOfWork
{
}
