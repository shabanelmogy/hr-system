import type { ProfileRepository } from '../../domain/repositories/profile-repository';

export class DefaultProfileRepository implements ProfileRepository {
  constructor(private readonly remote: ProfileRepository) {}

  getInfo() { return this.remote.getInfo(); }
  getPhoto() { return this.remote.getPhoto(); }
  updateInfo(request: Parameters<ProfileRepository['updateInfo']>[0]) { return this.remote.updateInfo(request); }
  updatePhoto(photo: Parameters<ProfileRepository['updatePhoto']>[0]) { return this.remote.updatePhoto(photo); }
  changePassword(request: Parameters<ProfileRepository['changePassword']>[0]) { return this.remote.changePassword(request); }
}
