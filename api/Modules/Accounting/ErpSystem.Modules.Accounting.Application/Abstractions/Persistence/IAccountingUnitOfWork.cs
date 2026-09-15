using ErpSystem.BuildingBlocks.Application.Abstractions.Persistence;

namespace ErpSystem.Modules.Accounting.Application.Abstractions.Persistence;

/// <summary>
/// Unit of work owned by the Accounting module.
///
/// A module-specific contract keeps Accounting handlers isolated from the
/// shared <see cref="IUnitOfWork"/> registrations owned by other modules.
/// </summary>
public interface IAccountingUnitOfWork : IUnitOfWork
{
}
