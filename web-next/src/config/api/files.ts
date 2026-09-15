import type { FilesRoute } from './types';
import { version } from "./constants";

export const files: FilesRoute = {
  getAll: `${version}/Files/GetAll`,
  upload: `${version}/Files/Upload`,
  uploadMany: `${version}/Files/UploadMany`,
  uploadImage: `${version}/Files/UploadImage`,
  checkAuthorization: `${version}/Files/CheckAuthorization`,
  stream: (id: string) => `${version}/Files/Stream/${encodeURIComponent(id)}`,
  download: (storedFileName: string) => `${version}/Files/Download/${encodeURIComponent(storedFileName)}`,
  delete: (storedFileName: string) => `${version}/Files/Delete/${encodeURIComponent(storedFileName)}`,
};
