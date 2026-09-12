using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Accounting.Application.Messaging;

/// <summary>
/// Accounting-owned inbox boundary. The module-specific contract prevents a
/// different module's inbox from being selected by an unqualified DI lookup.
/// </summary>
public interface IAccountingInbox : IIntegrationEventInbox
{
}
