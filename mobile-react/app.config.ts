import type { ConfigContext, ExpoConfig } from 'expo/config';

const LOCAL_NATIVE_PROJECT_ID = '00000000-0000-4000-8000-000000000057';

function getAppLinkHost(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  const url = new URL(candidate.includes('://') ? candidate : `https://${candidate}`);
  if (
    url.protocol !== 'https:' ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.port ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error('EXPO_PUBLIC_APP_LINK_HOST must be an HTTPS host without a port, path, or query.');
  }

  return url.hostname;
}

function getEasProjectId(value: unknown, source: string): string | null {
  if (value !== undefined && value !== null && typeof value !== 'string') {
    throw new Error(`${source} must be a valid UUID.`);
  }

  const candidate = typeof value === 'string' ? value.trim() : '';
  if (!candidate) return null;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)) {
    throw new Error(`${source} must be a valid UUID.`);
  }

  return candidate;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const appLinkHost = getAppLinkHost(process.env.EXPO_PUBLIC_APP_LINK_HOST);
  const existingExtra = config.extra ?? {};
  const existingEas =
    typeof existingExtra.eas === 'object' && existingExtra.eas !== null
      ? (existingExtra.eas as Record<string, unknown>)
      : {};
  const existingProjectId = getEasProjectId(existingEas.projectId, 'config.extra.eas.projectId');
  const configuredProjectId = getEasProjectId(process.env.EXPO_EAS_PROJECT_ID, 'EXPO_EAS_PROJECT_ID');
  const buildProjectId = getEasProjectId(process.env.EAS_BUILD_PROJECT_ID, 'EAS_BUILD_PROJECT_ID');
  const realProjectIds = [configuredProjectId, existingProjectId, buildProjectId]
    .filter((value): value is string => value !== null);
  if (new Set(realProjectIds.map((value) => value.toLowerCase())).size > 1) {
    throw new Error(
      'Expo project ID mismatch between EXPO_EAS_PROJECT_ID, config.extra.eas.projectId, and EAS_BUILD_PROJECT_ID.',
    );
  }
  const realProjectId = configuredProjectId ?? existingProjectId ?? buildProjectId;
  const localNativeBuild = process.env.ERP_LOCAL_NATIVE_BUILD === 'true';
  const easBuild = process.env.EAS_BUILD === 'true';
  if (easBuild && !appLinkHost) {
    throw new Error(
      'EAS_BUILD requires EXPO_PUBLIC_APP_LINK_HOST to be a valid HTTPS host for app links.',
    );
  }
  const releaseChannel = process.env.EXPO_PUBLIC_RELEASE_CHANNEL?.trim()
    || (easBuild ? 'production' : 'development');
  const apiContractVersion = process.env.EXPO_PUBLIC_API_CONTRACT_VERSION?.trim() || 'v1';
  const demoLoginSetting = process.env.EXPO_PUBLIC_DEMO_LOGIN_ENABLED?.trim().toLowerCase();
  if (demoLoginSetting && demoLoginSetting !== 'true' && demoLoginSetting !== 'false') {
    throw new Error('EXPO_PUBLIC_DEMO_LOGIN_ENABLED must be true or false.');
  }
  const demoLoginEnabled = demoLoginSetting
    ? demoLoginSetting === 'true'
    : !easBuild && process.env.NODE_ENV !== 'production';
  if (!/^[a-z][a-z0-9-]{1,31}$/i.test(releaseChannel)) {
    throw new Error('EXPO_PUBLIC_RELEASE_CHANNEL must be a short alphanumeric channel name.');
  }
  if (!/^v\d+$/.test(apiContractVersion)) {
    throw new Error('EXPO_PUBLIC_API_CONTRACT_VERSION must use the vN format.');
  }

  if (easBuild && !realProjectId) {
    throw new Error(
      'EAS_BUILD requires a real Expo project ID. Set EXPO_EAS_PROJECT_ID or configure extra.eas.projectId (run eas init).',
    );
  }

  const projectId = realProjectId ?? (localNativeBuild ? LOCAL_NATIVE_PROJECT_ID : null);
  const existingObserve =
    typeof existingEas.observe === 'object' && existingEas.observe !== null
      ? (existingEas.observe as Record<string, unknown>)
      : {};
  const eas = projectId
    ? {
        ...existingEas,
        projectId,
        observe: {
          ...existingObserve,
          dispatchingEnabled: Boolean(realProjectId),
        },
      }
    : Object.keys(existingEas).length > 0
      ? {
          ...existingEas,
          ...(Object.keys(existingObserve).length > 0
            ? { observe: { ...existingObserve, dispatchingEnabled: false } }
            : {}),
        }
      : null;

  return {
    ...config,
    name: config.name ?? 'ERP System',
    slug: config.slug ?? 'erp-system-mobile',
    scheme: config.scheme ?? 'erpsystem',
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
      bundleIdentifier: config.ios?.bundleIdentifier ?? 'com.erpsystem.mobile',
      ...(appLinkHost
        ? { associatedDomains: [`applinks:${appLinkHost}`] }
        : {})
    },
    android: {
      ...config.android,
      package: config.android?.package ?? 'com.erpsystem.mobile',
      allowBackup: false,
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
                  },
                  {
                    scheme: 'https',
                    host: appLinkHost,
                    pathPrefix: '/reset-password'
                  }
                ],
                category: ['BROWSABLE', 'DEFAULT']
              }
            ]
          }
        : {})
    },
    extra: {
      ...existingExtra,
      ...(eas ? { eas } : {}),
      release: {
        channel: releaseChannel,
        apiContractVersion,
        demoLoginEnabled,
        commit: process.env.EAS_BUILD_GIT_COMMIT_HASH?.trim() || 'development',
      },
    }
  };
};
