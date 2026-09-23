import { createLedgerSetupUseCases } from '../application/ledger-setup-use-cases';
import { ledgerSetupRemoteDataSource } from '../data/remote/ledger-setup-remote-data-source';
import { DefaultLedgerSetupRepository } from '../data/repositories/default-ledger-setup-repository';

export const ledgerSetupRepository = new DefaultLedgerSetupRepository(ledgerSetupRemoteDataSource);
export const ledgerSetupUseCases = createLedgerSetupUseCases(ledgerSetupRepository);
