using ErpSystem.BuildingBlocks.Messaging;

namespace ErpSystem.Modules.Contacts.Application.Messaging;

/// <summary>
/// Contacts-owned outbox boundary. Keeping the module identity in the
/// application contract prevents another module's outbox from being selected
/// by an unqualified DI registration.
/// </summary>
public interface IContactsOutbox : IIntegrationEventOutbox
{
}
