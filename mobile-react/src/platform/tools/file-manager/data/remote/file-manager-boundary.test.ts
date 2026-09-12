import { fileManagerEndpoints } from './file-manager-endpoints';
import { storedFileSchema } from './file-manager-schemas';

describe('file manager remote boundary', () => {
  it('preserves file endpoint routes', () => {
    expect(fileManagerEndpoints.getAll).toBe('files/getAll');
    expect(fileManagerEndpoints.uploadMany).toBe('files/uploadMany');
    expect(fileManagerEndpoints.download('stored file.pdf')).toBe('files/download/stored%20file.pdf');
    expect(fileManagerEndpoints.stream('id/1')).toBe('files/stream/id%2F1');
    expect(fileManagerEndpoints.delete('stored file.pdf')).toBe('files/delete/stored%20file.pdf');
  });

  it('parses the canonical stored-file shape and rejects incomplete data', () => {
    expect(storedFileSchema.parse({
      id: 'file-1',
      fileName: 'policy.pdf',
      storedFileName: 'stored.pdf',
      contentType: 'application/pdf',
      fileExtension: '.pdf',
      createdOn: '2026-08-20T10:00:00Z',
      createdByPc: 'MOBILE',
      createdById: 'user-1',
      isDeleted: false,
    })).toMatchObject({ fileName: 'policy.pdf', isDeleted: false });
    expect(storedFileSchema.safeParse({ fileName: 'missing.pdf' }).success).toBe(false);
  });
});
