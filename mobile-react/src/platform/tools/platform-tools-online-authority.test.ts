import type {
  PreparedFilePreview,
  StoredFile,
  UploadFileAsset,
} from './file-manager/domain/models/file-manager';
import type { FileManagerRepository } from './file-manager/domain/repositories/file-manager-repository';
import { DefaultFileManagerRepository } from './file-manager/data/repositories/default-file-manager-repository';
import type { LocalizationRepository } from './localization/domain/repositories/localization-repository';
import { DefaultLocalizationRepository } from './localization/data/repositories/default-localization-repository';

describe('platform tools online-authoritative repositories', () => {
  it('delegates file mutations directly to the remote data source', async () => {
    const uploaded: UploadFileAsset[][] = [];
    const deleted: string[] = [];
    const remote: FileManagerRepository = {
      getFiles: async () => [],
      uploadFiles: async (files) => { uploaded.push([...files]); },
      deleteFile: async (storedFileName) => { deleted.push(storedFileName); },
      downloadFile: async () => undefined,
      prepareFilePreview: async () => preview,
      getAuthenticatedFileSource: async () => ({ uri: 'https://example.test/file' }),
      openPreparedFile: async () => undefined,
    };
    const repository = new DefaultFileManagerRepository(remote);
    const file: UploadFileAsset = {
      uri: 'file:///policy.pdf',
      name: 'policy.pdf',
      mimeType: 'application/pdf',
      size: 123,
    };

    await repository.uploadFiles([file]);
    await repository.deleteFile('stored-policy.pdf');

    expect(uploaded).toEqual([[file]]);
    expect(deleted).toEqual(['stored-policy.pdf']);
  });

  it('delegates localization updates directly to the remote data source', async () => {
    const updates: { culture: 'ar-EG' | 'en-US'; key: string; value: string }[] = [];
    const remote: LocalizationRepository = {
      getLocalization: async () => [],
      updateLocalization: async (request) => { updates.push(request); },
    };
    const repository = new DefaultLocalizationRepository(remote);

    await repository.updateLocalization({ culture: 'en-US', key: 'welcome', value: 'Welcome' });

    expect(updates).toEqual([{ culture: 'en-US', key: 'welcome', value: 'Welcome' }]);
  });
});

const storedFile: StoredFile = {
  id: 'file-1',
  fileName: 'policy.pdf',
  storedFileName: 'stored-policy.pdf',
  contentType: 'application/pdf',
  fileExtension: '.pdf',
  createdOn: '2026-09-10T00:00:00Z',
  createdByPc: 'TEST',
  createdById: 'user-1',
  isDeleted: false,
};

const preview: PreparedFilePreview = {
  uri: storedFile.fileName,
  size: 123,
  contentType: storedFile.contentType,
  readText: async () => '',
  dispose: () => undefined,
};
