import "server-only";

export type PreparedBackendBody = {
  body: BodyInit | null | undefined;
  replayable: boolean;
  streaming: boolean;
};

export class RequestBodyTooLargeError extends Error {
  constructor(readonly maxBytes: number) {
    super(`Request body exceeds the ${maxBytes}-byte proxy limit`);
    this.name = "RequestBodyTooLargeError";
  }
}

const streamedRequestTypes = [
  "multipart/form-data",
  "application/octet-stream",
] as const;

const forwardedResponseHeaders = [
  "accept-ranges",
  "content-disposition",
  "content-length",
  "content-range",
  "content-type",
  "etag",
  "last-modified",
  "retry-after",
  "www-authenticate",
  "x-correlation-id",
] as const;

export const DEFAULT_MAX_BUFFERED_BODY_BYTES = 10 * 1024 * 1024;

export async function prepareBackendBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BUFFERED_BODY_BYTES,
): Promise<PreparedBackendBody> {
  if (["GET", "HEAD"].includes(request.method) || !request.body) {
    return { body: undefined, replayable: true, streaming: false };
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (streamedRequestTypes.some((type) => contentType.startsWith(type))) {
    return { body: request.body, replayable: false, streaming: true };
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new RequestBodyTooLargeError(maxBytes);
  }

  if (!request.body) {
    return { body: undefined, replayable: true, streaming: false };
  }
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      total += result.value.byteLength;
      if (total > maxBytes) {
        await reader.cancel("proxy body limit exceeded");
        throw new RequestBodyTooLargeError(maxBytes);
      }
      chunks.push(result.value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return {
    body,
    replayable: true,
    streaming: false,
  };
}

export function copyBackendResponseHeaders(
  source: Headers,
  target: Headers,
) {
  for (const name of forwardedResponseHeaders) {
    const value = source.get(name);
    if (value) target.set(name, value);
  }
}
