import {
  beginClientNavigation,
  isClientTelemetryEnabled,
  reportClientError,
} from "@/lib/observability/clientTelemetry";
import type { ClientNavigationType } from "@/lib/observability/clientTelemetryContract";

if (isClientTelemetryEnabled()) {
  window.addEventListener("error", (event) => {
    reportClientError("window-error", event.error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportClientError("unhandled-rejection", event.reason);
  });
}

export function onRouterTransitionStart(
  _url: string,
  navigationType: ClientNavigationType,
) {
  beginClientNavigation(navigationType);
}
