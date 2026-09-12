import { createProfileUseCases } from '../application/profile-use-cases';
import { profileRemoteDataSource } from '../data/remote/profile/profile-remote-data-source';
import { DefaultProfileRepository } from '../data/repositories/default-profile-repository';

export const profileRepository = new DefaultProfileRepository(profileRemoteDataSource);
export const profileUseCases = createProfileUseCases(profileRepository);
