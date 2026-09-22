import { createCurrencyUseCases } from '../application/currency-use-cases';
import { currencyRemoteDataSource } from '../data/remote/currency-remote-data-source';
import { DefaultCurrencyRepository } from '../data/repositories/default-currency-repository';

export const currencyRepository = new DefaultCurrencyRepository(currencyRemoteDataSource);
export const currencyUseCases = createCurrencyUseCases(currencyRepository);
