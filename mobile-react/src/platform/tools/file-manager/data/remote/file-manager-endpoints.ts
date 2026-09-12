export const fileManagerEndpoints = {
  getAll: 'files/getAll',
  uploadMany: 'files/uploadMany',
  download: (storedFileName: string) => `files/download/${encodeURIComponent(storedFileName)}`,
  stream: (id: string) => `files/stream/${encodeURIComponent(id)}`,
  delete: (storedFileName: string) => `files/delete/${encodeURIComponent(storedFileName)}`,
} as const;
