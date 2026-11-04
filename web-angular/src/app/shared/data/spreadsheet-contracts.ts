export interface SpreadsheetPolicy {
  readonly headers: readonly string[];
  readonly maxRows: number;
  readonly maxBytes: number;
}
export interface SpreadsheetRow {
  readonly rowNumber: number;
  readonly values: readonly string[];
}
export type ImportRowStatus =
  'pending' | 'invalid' | 'submitted' | 'uploaded' | 'failed' | 'uncertain';
export type ImportPhase =
  'idle' | 'parsing' | 'preview' | 'submitting' | 'succeeded' | 'failed' | 'uncertain';
export class SpreadsheetError extends Error {
  constructor(
    readonly code: string,
    readonly details: Record<string, string | number> = {},
  ) {
    super(code);
  }
}
