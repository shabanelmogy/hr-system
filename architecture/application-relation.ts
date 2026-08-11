/**
 * Architecture metadata for Graphify and repository tooling.
 * This file is not imported by either application at runtime.
 */
export class HrManagementSystemApi {
  readonly path = "api/HrManagementSystem.Api";
  readonly routeDefinitions =
    "api/HrManagementSystem.Application/Common/Consts/ApiRoutes.cs";

  handleHttpRequest(): string {
    return this.path;
  }
}

export class WebNextFrontend {
  readonly path = "web-next";
  readonly endpointRegistry = "web-next/src/config/api/index.ts";
  readonly apiProxy = "web-next/src/app/api/[...path]/route.ts";

  constructor(readonly backend: HrManagementSystemApi) {}

  consumesHttpApi(): string {
    return this.backend.handleHttpRequest();
  }
}

export class LegacyWebReference {
  readonly path = "web";
  readonly status = "reference-only";

  constructor(readonly replacement: WebNextFrontend) {}
}

export const api = new HrManagementSystemApi();
export const webNext = new WebNextFrontend(api);
export const legacyWeb = new LegacyWebReference(webNext);
