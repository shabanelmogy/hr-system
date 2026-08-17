import type { StoredFile } from '@/src/features/platform-tools/types/platform-tools';
import type { AppIconName } from '@/src/shared/components';

export type FileGroupId =
  | 'images'
  | 'documents'
  | 'spreadsheets'
  | 'presentations'
  | 'pdfs'
  | 'audio'
  | 'video'
  | 'archives'
  | 'code'
  | 'others';

export type FilePreviewKind = 'image' | 'video' | 'audio' | 'text' | 'external';

export interface FileGroupDefinition {
  id: FileGroupId;
  icon: AppIconName;
  labelKey: string;
}

export interface FileGroup extends FileGroupDefinition {
  files: StoredFile[];
}

export const fileGroupDefinitions: readonly FileGroupDefinition[] = [
  { id: 'images', icon: 'images-outline', labelKey: 'platformTools.files.groups.images' },
  { id: 'documents', icon: 'document-text-outline', labelKey: 'platformTools.files.groups.documents' },
  { id: 'spreadsheets', icon: 'grid-outline', labelKey: 'platformTools.files.groups.spreadsheets' },
  { id: 'presentations', icon: 'easel-outline', labelKey: 'platformTools.files.groups.presentations' },
  { id: 'pdfs', icon: 'document-outline', labelKey: 'platformTools.files.groups.pdfs' },
  { id: 'audio', icon: 'musical-notes-outline', labelKey: 'platformTools.files.groups.audio' },
  { id: 'video', icon: 'videocam-outline', labelKey: 'platformTools.files.groups.video' },
  { id: 'archives', icon: 'archive-outline', labelKey: 'platformTools.files.groups.archives' },
  { id: 'code', icon: 'code-slash-outline', labelKey: 'platformTools.files.groups.code' },
  { id: 'others', icon: 'folder-open-outline', labelKey: 'platformTools.files.groups.others' },
] as const;

const extensionGroups: Record<Exclude<FileGroupId, 'others'>, ReadonlySet<string>> = {
  images: new Set(['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'webp', 'tiff', 'heic']),
  documents: new Set(['doc', 'docx', 'rtf', 'odt', 'txt', 'md']),
  spreadsheets: new Set(['xls', 'xlsx', 'ods', 'csv']),
  presentations: new Set(['ppt', 'pptx', 'odp']),
  pdfs: new Set(['pdf']),
  audio: new Set(['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac']),
  video: new Set(['mp4', 'avi', 'mkv', 'mov', 'webm', 'wmv', 'm4v']),
  archives: new Set(['zip', 'rar', '7z', 'tar', 'gz', 'bz2']),
  code: new Set([
    'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs', 'go', 'rb', 'php',
    'html', 'css', 'json', 'yml', 'yaml', 'xml', 'sql', 'sh', 'ps1', 'log',
  ]),
};

const textPreviewExtensions = new Set([
  'txt', 'md', 'csv', 'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'c', 'cpp', 'cs',
  'go', 'rb', 'php', 'html', 'css', 'json', 'yml', 'yaml', 'xml', 'sql', 'sh',
  'ps1', 'log',
]);

export function getFileExtension(file: StoredFile): string {
  const declared = file.fileExtension.trim().replace(/^\./, '');
  if (declared) return declared.toLocaleLowerCase();
  const separator = file.fileName.lastIndexOf('.');
  return separator >= 0 ? file.fileName.slice(separator + 1).toLocaleLowerCase() : '';
}

export function classifyFile(file: StoredFile): FileGroupId {
  const extension = getFileExtension(file);
  const mime = file.contentType.toLocaleLowerCase();

  if (mime.startsWith('image/') || extensionGroups.images.has(extension)) return 'images';
  if (mime === 'application/pdf' || extensionGroups.pdfs.has(extension)) return 'pdfs';
  if (mime.includes('spreadsheet') || extensionGroups.spreadsheets.has(extension)) {
    return 'spreadsheets';
  }
  if (mime.includes('presentation') || extensionGroups.presentations.has(extension)) {
    return 'presentations';
  }
  if (mime.startsWith('audio/') || extensionGroups.audio.has(extension)) return 'audio';
  if (mime.startsWith('video/') || extensionGroups.video.has(extension)) return 'video';
  if (extensionGroups.archives.has(extension)) return 'archives';
  if (extensionGroups.code.has(extension)) return 'code';
  if (mime.startsWith('text/') || extensionGroups.documents.has(extension)) return 'documents';
  return 'others';
}

export function getFilePreviewKind(file: StoredFile): FilePreviewKind {
  const group = classifyFile(file);
  const extension = getFileExtension(file);
  const mime = file.contentType.toLocaleLowerCase();
  if (group === 'images') return 'image';
  if (group === 'video') return 'video';
  if (group === 'audio') return 'audio';
  if (textPreviewExtensions.has(extension) || mime.startsWith('text/')) return 'text';
  return 'external';
}

export function groupFiles(files: readonly StoredFile[]): FileGroup[] {
  const grouped = new Map<FileGroupId, StoredFile[]>(
    fileGroupDefinitions.map((definition) => [definition.id, []]),
  );
  files.forEach((file) => grouped.get(classifyFile(file))?.push(file));
  return fileGroupDefinitions.map((definition) => ({
    ...definition,
    files: grouped.get(definition.id) ?? [],
  }));
}

export function getFileIcon(file: StoredFile): AppIconName {
  const group = classifyFile(file);
  return fileGroupDefinitions.find((definition) => definition.id === group)?.icon
    ?? 'document-outline';
}
