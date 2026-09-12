type CompanySwitchVerificationOptions = {
  companyId: number;
  revalidate: () => Promise<void>;
  readCompanyId: () => number | null | undefined;
  clearStaleSession: () => void;
  attempts?: number;
};

/**
 * Verifies the server-selected company after the switch endpoint completes.
 * The first session response can still reflect the previous cookie, so keep
 * the retry bounded and clear that stale identity before trying again.
 */
export async function verifyTargetCompany({
  companyId,
  revalidate,
  readCompanyId,
  clearStaleSession,
  attempts = 2,
}: CompanySwitchVerificationOptions): Promise<boolean> {
  const boundedAttempts = Number.isFinite(attempts)
    ? Math.max(1, Math.floor(attempts))
    : 1;
  for (let attempt = 0; attempt < boundedAttempts; attempt += 1) {
    await revalidate();
    if (readCompanyId() === companyId) return true;
    if (attempt + 1 < boundedAttempts) clearStaleSession();
  }
  return false;
}
