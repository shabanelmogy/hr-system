export const APP_VERSION = "1.0.5"; // نفس رقم الإصدار اللي نشرته

/**
 * Check if there's a new version available
 */
export async function checkForUpdates() {
  try {
    const response = await fetch("/version.json", { cache: "no-store" });
    const data = await response.json();

    if (data?.version && data.version !== APP_VERSION) {
      console.log(`🆕 New version detected: ${data.version}`);
      return true;
    }
  } catch (err) {
    console.warn("Could not check version:", err);
  }
  return false;
}

/**
 * Force reload by clearing cache and reloading window
 */
export function forceReload() {
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }

  window.location.reload();
}
