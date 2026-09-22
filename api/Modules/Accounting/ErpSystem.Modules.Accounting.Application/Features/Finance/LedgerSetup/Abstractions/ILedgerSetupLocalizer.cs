namespace ErpSystem.Modules.Accounting.Application.Features.Finance.LedgerSetup.Abstractions;

/// <summary>
/// Module-owned localization port for the Ledger Setup boundary.
/// Keeping this contract inside Accounting prevents the module from depending
/// on another module's localization files when it is extracted later.
/// </summary>
public interface ILedgerSetupLocalizer
{
    string Text(string key);
    string Format(string key, params object[] arguments);
}
