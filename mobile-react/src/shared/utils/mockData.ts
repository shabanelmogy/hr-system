/**
 * Selects a sample without repeating it until every sample has been used.
 * Mock generation only fills the active form; it never submits or persists data.
 */
export function getNextMockSample<T>(
  samples: readonly T[],
  usedIndexes: Set<number>,
  random: () => number = Math.random,
): T {
  if (samples.length === 0) throw new Error('At least one mock sample is required.');
  if (usedIndexes.size >= samples.length) usedIndexes.clear();

  const startIndex = Math.min(Math.max(Math.floor(random() * samples.length), 0), samples.length - 1);
  let index = startIndex;
  while (usedIndexes.has(index)) index = (index + 1) % samples.length;
  usedIndexes.add(index);
  return samples[index];
}
