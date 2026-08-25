import { ROUTES } from '@/src/core/constants/routes';
import { resolveNotificationActionRoute } from '../notification-presentation';

describe('notification action routes', () => {
  it('opens country notifications on the concrete mobile Countries screen', () => {
    expect(resolveNotificationActionRoute('/basic-data/countries'))
      .toBe(ROUTES.basicData.countries);
    expect(resolveNotificationActionRoute('/basic-data/geographical-information/countries'))
      .toBe(ROUTES.basicData.countries);
  });

  it('rejects unknown and protocol-relative action URLs', () => {
    expect(resolveNotificationActionRoute('/unknown')).toBeNull();
    expect(resolveNotificationActionRoute('//malicious.example')).toBeNull();
  });
});
