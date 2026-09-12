import type { ProfileRepository } from '../domain/repositories/profile-repository';

export type ProfileUseCases = ProfileRepository;

export function createProfileUseCases(repository: ProfileRepository): ProfileUseCases {
  return {
    getInfo: () => repository.getInfo(),
    getPhoto: () => repository.getPhoto(),
    updateInfo: (request) => repository.updateInfo(request),
    updatePhoto: (photo) => repository.updatePhoto(photo),
    changePassword: (request) => repository.changePassword(request),
  };
}
