export interface OfflinePolicyRequestGuard {
  selectScope(scopeKey: string | null): number;
  capture(scopeKey: string | null): number | null;
  isCurrent(scopeKey: string | null, generation: number): boolean;
}

export function createOfflinePolicyRequestGuard(): OfflinePolicyRequestGuard {
  let selectedScopeKey: string | null = null;
  let generation = 0;

  return {
    selectScope(scopeKey) {
      if (scopeKey !== selectedScopeKey) {
        selectedScopeKey = scopeKey;
        generation += 1;
      }
      return generation;
    },
    capture(scopeKey) {
      return scopeKey === selectedScopeKey ? generation : null;
    },
    isCurrent(scopeKey, requestGeneration) {
      return scopeKey === selectedScopeKey && requestGeneration === generation;
    },
  };
}
