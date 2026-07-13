import type { FilesRoute, Id } from './types';
import { version } from "./constants";

export const files: FilesRoute = {
  uploadMany: `${version}/Files/UploadMany`,
  download: (id: Id) => `${version}/Files/Download?id=${id}`,
  delete: (id: Id) => `${version}/Files/Delete?id=${id}`,
};
