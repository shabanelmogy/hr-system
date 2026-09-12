using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Accounting.Application.Messaging;

/// <summary>
/// Accounting-owned outbox boundary. The module-specific contract keeps
/// Accounting writes independent from other module outbox registrations.
/// </summary>
public interface IAccountingOutbox : IIntegrationEventOutbox
{
}
