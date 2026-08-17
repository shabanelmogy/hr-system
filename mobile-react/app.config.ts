import type { ConfigContext, ExpoConfig } from 'expo/config';

function getAppLinkHost(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
  if (url.protocol !== 'https:' || url.port || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_APP_LINK_HOST must be an HTTPS host without a port, path, or query.');
  }

  return url.hostname;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appLinkHost = getAppLinkHost(process.env.EXPO_PUBLIC_APP_LINK_HOST);

  return {
    ...config,
    name: config.name ?? 'HR Management',
    slug: config.slug ?? 'hr-management-mobile',
    scheme: config.scheme ?? 'hrmanagement',
    plugins: [
      ...(config.plugins ?? []),
      [
        'expo-audio',
        {
          microphonePermission: false,
          recordAudioAndroid: false,
        },
      ],
      'expo-video',
    ],
    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier ?? 'com.hrmanagementsystem.mobile',
      ...(appLinkHost
        ? { associatedDomains: [`applinks:${appLinkHost}`] }
        : {})
    },
    android: {
      ...config.android,
      package: config.android?.package ?? 'com.hrmanagementsystem.mobile',
      ...(appLinkHost
        ? {
            intentFilters: [
              {
                action: 'VIEW',
                autoVerify: true,
                data: [
                  {
                    scheme: 'https',
                    host: appLinkHost,
                    pathPrefix: '/confirm-email'
                  },
                  {
                    scheme: 'https',
                    host: appLinkHost,
                    pathPrefix: '/accept-invitation'
                  }
                ],
                category: ['BROWSABLE', 'DEFAULT']
              }
            ]
          }
        : {})
    }
  };
};
