import type { Instrumentation } from "next";

export const onRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  const digest =
    typeof error === "object" && error !== null && "digest" in error
      ? String(error.digest)
      : undefined;
  const errorName = error instanceof Error ? error.name : typeof error;
  const requestPath = request.path.split("?", 1)[0];

  console.error("[next.request.error]", {
    digest,
    errorName,
    method: request.method,
    path: requestPath,
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
    renderSource: context.renderSource,
  });
};
