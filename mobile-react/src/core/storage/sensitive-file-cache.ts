import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

export type SensitiveFileCacheArea = 'download' | 'preview';

const directoryNames: Record<SensitiveFileCacheArea, string> = {
  download: 'hr-downloads',
  preview: 'hr-file-previews',
};

export function createSensitiveCacheFile(
  area: SensitiveFileCacheArea,
  fileName: string,
): File {
  const directory = new Directory(Paths.cache, directoryNames[area]);
  if (!directory.exists) directory.create({ intermediates: true });
  const uniquePrefix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return new File(directory, `${uniquePrefix}-${fileName}`);
}

export async function clearSensitiveFileCache(): Promise<void> {
  if (Platform.OS === 'web') return;

  directoryNamesToClear().forEach((name) => {
    try {
      const directory = new Directory(Paths.cache, name);
      if (directory.exists) directory.delete();
    } catch {
      // Cache cleanup is best-effort; authentication cleanup must always continue.
    }
  });
}

function directoryNamesToClear(): string[] {
  return Object.values(directoryNames);
}
