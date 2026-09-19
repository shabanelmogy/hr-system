import { createStateUseCases } from '../application/state-use-cases';
import { stateRemoteDataSource } from '../data/remote/state-remote-data-source';
import { DefaultStateRepository } from '../data/repositories/default-state-repository';

export const stateRepository = new DefaultStateRepository(stateRemoteDataSource);
export const stateUseCases = createStateUseCases(stateRepository);
