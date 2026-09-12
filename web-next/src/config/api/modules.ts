import { version } from "./constants";

export const modules = {
  installed: `${version}/modules/installed`,
  accessible: `${version}/modules/accessible`,
} as const;
