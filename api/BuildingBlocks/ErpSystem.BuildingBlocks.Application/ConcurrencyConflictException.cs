namespace ErpSystem.BuildingBlocks.Application;

/// <summary>
/// Raised when a command's expected aggregate revision is no longer current.
/// The host maps this to the same stable conflict response used for database
/// concurrency tokens.
/// </summary>
public sealed class ConcurrencyConflictException(string message = "The record was changed by another operation.")
    : Exception(message);
