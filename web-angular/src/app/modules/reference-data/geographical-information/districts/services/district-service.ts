import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, from, map, switchMap, throwError, timeout } from 'rxjs';
import { ERP_API_ORIGIN } from '../../../../../config/api-origin';
import { BrowserMutationSecurity } from '../../../../../platform/auth/session.public-api';
import { classifyCommandFailure } from '../../../../../shared/data/public-api';
import {
  parseDistrictBatch,
  parseDistrictArchivedCount,
  type DistrictLifecycleAction,
} from '../types/district-lifecycle';
import {
  parseDistrictId,
  parseDistrictPage,
  districtDetailSchema,
  districtLookupSchema,
  districtQueryParameters,
  type DistrictQuery,
} from '../types/district';
import {
  parseDistrictMutation,
  districtMutationFields,
  type DistrictDraft,
} from '../validation/district-mutation';
import * as z from 'zod/mini';

const createdCount = z.strictObject({ createdCount: z.int().check(z.minimum(0), z.maximum(100)) });
@Injectable({ providedIn: 'root' })
export class DistrictService {
  private readonly http = inject(HttpClient);
  private readonly origin = inject(ERP_API_ORIGIN);
  private readonly security = inject(BrowserMutationSecurity);
  constructor() {
    const url = new URL(this.origin);
    if (url.protocol !== 'https:' || url.origin !== this.origin)
      throw Error('An exact HTTPS API origin is required.');
  }
  page(input: DistrictQuery) {
    return defer(() => {
      const { query, params } = districtQueryParameters(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/districts', { withCredentials: true, params })
        .pipe(
          timeout(10000),
          map((value) => parseDistrictPage(value, query)),
        );
    });
  }
  detail(input: number) {
    return defer(() => {
      const id = parseDistrictId(input);
      return this.http
        .get<unknown>(this.origin + '/api/v1/districts/' + id, { withCredentials: true })
        .pipe(
          timeout(10000),
          map((value) => {
            const detail = districtDetailSchema.parse(value);
            if (detail.id !== id || detail.state.id !== detail.stateId)
              throw Error('Invalid District detail identity');
            return detail;
          }),
        );
    });
  }
  lookup(stateId?: number) {
    return defer(() => {
      const id = stateId === undefined ? undefined : parseDistrictId(stateId);
      return this.http
        .get<unknown>(this.origin + '/api/v1/districts/lookup', {
          withCredentials: true,
          params: id === undefined ? {} : { stateId: String(id) },
        })
        .pipe(
          timeout(10000),
          map((value) => {
            const values = z.array(districtLookupSchema).parse(value);
            if (
              new Set(values.map((item) => item.id)).size !== values.length ||
              values.some((item) => id !== undefined && item.stateId !== id)
            )
              throw Error('Invalid District lookup response');
            return values;
          }),
        );
    });
  }
  create(input: DistrictDraft) {
    return this.write(input, null);
  }
  update(id: number, input: DistrictDraft) {
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
  bulkCreate(input: readonly DistrictDraft[]) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        if (!Array.isArray(input) || input.length < 1 || input.length > 100)
          throw Error('Invalid District batch');
        const districts = input.map(parseDistrictMutation);
        return from(this.security.csrf()).pipe(
          switchMap((token) => {
            dispatched = true;
            return this.http.post<unknown>(
              this.origin + '/api/v1/districts/bulk',
              { districts },
              { withCredentials: true, headers: { 'X-ERP-XSRF': token }, observe: 'response' },
            );
          }),
          timeout(10000),
          map((response) => {
            if (response.status !== 201) throw Error('Invalid import status');
            const result = createdCount.parse(response.body).createdCount;
            if (result !== districts.length) throw Error('Invalid import count');
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
                districtMutationFields.map((field) => `districts[${index}].${field}`),
              ),
            ),
          ),
        ),
      );
    });
  }
  private lifecycle(action: DistrictLifecycleAction, input: readonly number[]) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        const ids = parseDistrictBatch(input),
          url = this.origin + '/api/v1/districts';
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
            if (action === 'bulk') return parseDistrictArchivedCount(response.body, ids.length);
            if (response.status !== 204) throw Error('Invalid lifecycle response');
            return 1;
          }),
        );
      }).pipe(
        catchError((error: unknown) => throwError(() => classifyCommandFailure(error, dispatched))),
      );
    });
  }
  private write(input: DistrictDraft, inputId: number | null) {
    return defer(() => {
      let dispatched = false;
      return defer(() => {
        const mutation = parseDistrictMutation(input),
          id = inputId === null ? null : parseDistrictId(inputId);
        return from(this.security.csrf()).pipe(
          switchMap((token) => {
            dispatched = true;
            const options = {
              withCredentials: true,
              headers: { 'X-ERP-XSRF': token },
              observe: 'response' as const,
            };
            return id === null
              ? this.http.post<unknown>(this.origin + '/api/v1/districts', mutation, options)
              : this.http.put<unknown>(this.origin + '/api/v1/districts/' + id, mutation, options);
          }),
          timeout(10000),
          map((response) => {
            if (
              (id === null && response.status !== 201) ||
              (id !== null && response.status !== 200)
            )
              throw Error('Invalid District command status');
            const result = districtDetailSchema.parse(response.body);
            if (
              result.isDeleted ||
              result.state.id !== result.stateId ||
              result.stateId !== mutation.stateId ||
              (id !== null && result.id !== id)
            )
              throw Error('Invalid District command result');
            return result;
          }),
        );
      }).pipe(
        catchError((error: unknown) =>
          throwError(() => classifyCommandFailure(error, dispatched, districtMutationFields)),
        ),
      );
    });
  }
}
