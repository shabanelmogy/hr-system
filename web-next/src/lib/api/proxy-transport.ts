import "server-only";

export type PreparedBackendBody = {
  body: BodyInit | null | undefined;
  replayable: boolean;
  streaming: boolean;
};

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
] as const;

export async function prepareBackendBody(
  request: Request,
): Promise<PreparedBackendBody> {
  if (["GET", "HEAD"].includes(request.method) || !request.body) {
    return { body: undefined, replayable: true, streaming: false };
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  if (streamedRequestTypes.some((type) => contentType.startsWith(type))) {
    return { body: request.body, replayable: false, streaming: true };
  }

  return {
    body: await request.arrayBuffer(),
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
