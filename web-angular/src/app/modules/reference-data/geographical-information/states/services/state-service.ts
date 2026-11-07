import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../../platform/auth/session.public-api';
import { classifyCommandFailure } from '../../../../../shared/data/public-api';
import {
  parseStateBatch,
  parseStateArchivedCount,
  type StateLifecycleAction,
} from '../types/state-lifecycle';
import {
  parseStateId,
  parseStatePage,
  stateDetailSchema,
  stateLookupSchema,
  stateQueryParameters,
  type StateQuery,
} from '../types/state';
import {
  parseStateMutation,
  stateMutationFields,
  type StateDraft,
} from '../validation/state-mutation';
import * as z from 'zod/mini';

const createdCount = z.strictObject({ createdCount: z.int().check(z.minimum(0), z.maximum(100)) });
@Injectable({ providedIn: 'root' })
export class StateService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required.');
  }
  page(input: StateQuery) {
    return defer(() => {
      const { query, params } = stateQueryParameters(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/states', { withCredentials: true, params })
        .pipe(
          timeout(10000),
          map((value) => parseStatePage(value, query)),
        );
    });
  }
  detail(input: number) {
    return defer(() => {
      const id = parseStateId(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/states/' + id, { withCredentials: true })
        .pipe(
          timeout(10000),
          map((value) => {
            const detail = stateDetailSchema.parse(value);
            if (detail.id !== id || detail.country.id !== detail.countryId)
              throw Error('Invalid State detail identity');
            return detail;
          }),
        );
    });
  }
  lookup(countryId?: number) {
    return defer(() => {
      const id = countryId === undefined ? undefined : parseStateId(countryId);
      return this.http
        .get<unknown>(this.origin + '/api/v1/states/lookup', {
          withCredentials: true,
          params: id === undefined ? {} : { countryId: String(id) },
        })
        .pipe(
          timeout(10000),
          map((value) => {
            const values = z.array(stateLookupSchema).parse(value);
            if (
              new Set(values.map((item) => item.id)).size !== values.length ||
              values.some((item) => id !== undefined && item.countryId !== id)
            )
              throw Error('Invalid State lookup response');
            return values;
          }),
        );
    });
  }
  create(input: StateDraft) {
    return this.write(input, null);
  }
  update(id: number, input: StateDraft) {
    return this.write(input, id);
  }
  archive(id: number) {
    return this.lifecycle('archive', [id]);
  }
  restore(id: number) {
    return this.lifecycle('restore', [id]);
  }
  bulkArchive(ids: readonly number[]) {
    return this.lifecycle('bulk', ids);
  }
  bulkCreate(input: readonly StateDraft[]) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        if (!Array.isArray(input) || input.length < 1 || input.length > 100)
          throw Error('Invalid State batch');
        const states = input.map(parseStateMutation);
        return from(this.security.csrf()).pipe(
          switchMap((token) => {
            dispatched = true;
            return this.http.post<unknown>(
              this.origin + '/api/v1/states/bulk',
              { states },
              { withCredentials: true, headers: { 'X-ERP-XSRF': token }, observe: 'response' },
            );
          }),
          timeout(10000),
          map((response) => {
            if (response.status !== 201) throw Error('Invalid import status');
            const result = createdCount.parse(response.body).createdCount;
            if (result !== states.length) throw Error('Invalid import count');
            return result;
          }),
        );
      }).pipe(
        catchError((error: unknown) =>
          throwError(() =>
            classifyCommandFailure(
              error,
              dispatched,
              input.flatMap((_, index) =>
                stateMutationFields.map((field) => `states[${index}].${field}`),
              ),
            ),
          ),
        ),
      );
    });
  }
  private lifecycle(action: StateLifecycleAction, input: readonly number[]) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        const ids = parseStateBatch(input),
          url = this.origin + '/api/v1/states';
        return from(this.security.csrf()).pipe(
          switchMap((token) => {
            dispatched = true;
            const options = {
              withCredentials: true,
              headers: { 'X-ERP-XSRF': token },
              observe: 'response' as const,
            };
            return action === 'archive'
              ? this.http.delete<unknown>(url + '/' + ids[0], options)
              : this.http.post<unknown>(
                  action === 'restore' ? url + '/' + ids[0] + '/restore' : url + '/bulk-archive',
                  action === 'bulk' ? { ids } : null,
                  options,
                );
          }),
          timeout(10000),
          map((response) => {
            if (action === 'bulk') return parseStateArchivedCount(response.body, ids.length);
            if (response.status !== 204) throw Error('Invalid lifecycle response');
            return 1;
          }),
        );
      }).pipe(
        catchError((error: unknown) => throwError(() => classifyCommandFailure(error, dispatched))),
      );
    });
  }
  private write(input: StateDraft, inputId: number | null) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        const mutation = parseStateMutation(input),
          id = inputId === null ? null : parseStateId(inputId);
        return from(this.security.csrf()).pipe(
          switchMap((token) => {
            dispatched = true;
            const options = {
              withCredentials: true,
              headers: { 'X-ERP-XSRF': token },
              observe: 'response' as const,
            };
            return id === null
              ? this.http.post<unknown>(this.origin + '/api/v1/states', mutation, options)
              : this.http.put<unknown>(this.origin + '/api/v1/states/' + id, mutation, options);
          }),
          timeout(10000),
          map((response) => {
            if (
              (id === null && response.status !== 201) ||
              (id !== null && response.status !== 200)
            )
              throw Error('Invalid State command status');
            const result = stateDetailSchema.parse(response.body);
            if (
              result.isDeleted ||
              result.country.id !== result.countryId ||
              result.countryId !== mutation.countryId ||
              (id !== null && result.id !== id)
            )
              throw Error('Invalid State command result');
            return result;
          }),
        );
      }).pipe(
        catchError((error: unknown) =>
          throwError(() => classifyCommandFailure(error, dispatched, stateMutationFields)),
        ),
      );
    });
  }
}
