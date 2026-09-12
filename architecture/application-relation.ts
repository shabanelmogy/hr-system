/**
 * Architecture metadata for Graphify and repository tooling.
 * This file is not imported by either application at runtime.
 */
export class ErpSystemApi {
  readonly path = "api/ErpSystem.Api";
  readonly routeDefinitions = "api/Modules/HR/ErpSystem.Modules.HR.Presentation/Common/Routes/ApiRoutes.cs";

  handleHttpRequest(): string {
    return this.path;
  }
}

export class WebNextFrontend {
  readonly path = "web-next";
  readonly endpointRegistry = "web-next/src/config/api/index.ts";
  readonly apiProxy = "web-next/src/app/api/[...path]/route.ts";

  constructor(readonly backend: ErpSystemApi) {}

  consumesHttpApi(): string {
    return this.backend.handleHttpRequest();
  }
}

export class LegacyWebReference {
  readonly path = "web";
  readonly status = "reference-only";

  constructor(readonly replacement: WebNextFrontend) {}
}

export class MobileReactFrontend {
  readonly path = "mobile-react";
  readonly apiClient = "mobile-react/src/core/api/api-service.ts";
  readonly environment = "mobile-react/src/core/config/env.ts";
  readonly routeDefinitions = "mobile-react/src/core/constants/routes.ts";

  constructor(readonly backend: ErpSystemApi) {}

  consumesHttpApi(): string {
    return this.backend.handleHttpRequest();
  }
}

export const api = new ErpSystemApi();
export const webNext = new WebNextFrontend(api);
export const mobileReact = new MobileReactFrontend(api);
export const legacyWeb = new LegacyWebReference(webNext);
