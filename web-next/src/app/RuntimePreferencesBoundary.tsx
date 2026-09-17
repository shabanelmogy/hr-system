import { cookies } from "next/headers";
import { RuntimePreferencesClientSync } from "./providers";
import { resolveRuntimePreferences } from "./runtime-preferences";

export async function RuntimePreferencesBoundary() {
  const preferences = resolveRuntimePreferences(await cookies());

  return <RuntimePreferencesClientSync preferences={preferences} />;
}
