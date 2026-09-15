import { AxiosError, isAxiosError } from 'axios';

export interface ApiProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  code?: string;
  codes?: string[];
  traceId?: string;
  correlationId?: string;
  errors?: Record<string, string[]>;
}

export function normalizeProblemDetails(value: unknown): ApiProblemDetails | undefined {
  if (!isRecord(value)) return undefined;

  const problem: ApiProblemDetails = {};
  copyString(value, 'type', problem);
  copyString(value, 'title', problem);
  copyString(value, 'detail', problem);
  copyString(value, 'code', problem);
  copyString(value, 'traceId', problem);
  copyString(value, 'correlationId', problem);

  if (typeof value.status === 'number' && Number.isInteger(value.status) && value.status >= 100 && value.status <= 599) {
    problem.status = value.status;
  }
  if (Array.isArray(value.codes) && value.codes.every((code) => typeof code === 'string')) {
    problem.codes = value.codes;
  }
  if (isRecord(value.errors)) {
    const entries = Object.entries(value.errors);
    if (entries.every(([, messages]) => Array.isArray(messages) && messages.every((message) => typeof message === 'string'))) {
      problem.errors = Object.fromEntries(entries) as Record<string, string[]>;
    }
  }

  return Object.keys(problem).length > 0 ? problem : undefined;
}

function copyString(
  source: Record<string, unknown>,
  key: 'type' | 'title' | 'detail' | 'code' | 'traceId' | 'correlationId',
  target: ApiProblemDetails,
): void {
  const candidate = source[key];
  if (typeof candidate === 'string' && candidate.trim().length > 0) target[key] = candidate;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof AxiosError || isAxiosError(error)) {
    const response = error.response;
    const problem = normalizeProblemDetails(response?.data);
    const status = response?.status ?? 0;
    const fallbackMessage =
      error.code === AxiosError.ETIMEDOUT || error.code === AxiosError.ECONNABORTED
        ? 'The request timed out.'
        : status > 0
          ? `The request failed (${status}).`
          : 'Unable to reach the server.';

    return new ApiError(status, problem?.detail ?? problem?.title ?? fallbackMessage, problem);
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return new ApiError(0, error.message.trim());
  }

  return new ApiError(0, 'An unexpected error occurred.');
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem?: ApiProblemDetails;

  constructor(status: number, message: string, problem?: ApiProblemDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}
