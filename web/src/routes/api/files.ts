import type { FilesRoute, Id } from './types';

const version = "/api/v1";

export const files: FilesRoute = {
  uploadMany: `${version}/Files/UploadMany`,
  download: (id: Id) => `${version}/Files/Download?id=${id}`,
  delete: (id: Id) => `${version}/Files/Delete?id=${id}`,
};
