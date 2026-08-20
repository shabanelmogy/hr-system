import { userProfilePhotoSchema, userProfileSchema } from '../profile-schemas';

describe('profile response schemas', () => {
  it('accepts the canonical profile response', () => {
    const profile = {
      id: 'fba56d28-71a8-4c19-81f5-8eccae5883e7',
      email: 'ada@example.test',
      userName: 'ada',
      firstName: 'Ada',
      lastName: 'Lovelace',
    };

    expect(userProfileSchema.parse(profile)).toEqual(profile);
  });

  it('accepts the nullable no-photo response', () => {
    expect(userProfilePhotoSchema.parse({ profilePicture: null, contentType: null })).toEqual({
      profilePicture: null,
      contentType: null,
    });
  });

  it('rejects a profile without its identifier', () => {
    expect(userProfileSchema.safeParse({
      email: 'ada@example.test',
      userName: 'ada',
      firstName: 'Ada',
      lastName: 'Lovelace',
    }).success).toBe(false);
  });
});
