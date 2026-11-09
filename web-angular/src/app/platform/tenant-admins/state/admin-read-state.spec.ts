import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { TenantAdminService } from '../services/tenant-admin-service';
import type { TenantAdmin } from '../types/tenant-admin';
import { adminFixture } from '../tenant-admin.fixture';
import { AdminReadState } from './admin-read-state';
describe('Tenant administrator authoritative read lifetime', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('exports only memberships of the requested tenant and invalidates stale snapshots', async () => {
    const identity = signal<Session | null>({ ...sessionFixture, roles: ['super_admin'] });
    const response = new Subject<readonly TenantAdmin[]>();
    TestBed.configureTestingModule({
      providers: [
        AdminReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantAdminService, useValue: { all: () => response.asObservable() } },
      ],
    });
    const reads = TestBed.inject(AdminReadState);
    TestBed.tick();
    response.next([
      adminFixture,
      { ...adminFixture, id: 'other', tenants: [], defaultTenantId: '' },
    ]);
    const source = reads.exportSource(
      [{ key: 'id', header: 'ID', value: (admin) => admin.id }],
      'en',
      't',
    );
    expect(source).not.toBeNull();
    expect(await source?.load(new AbortController().signal)).toEqual([{ ID: adminFixture.id }]);
    identity.set(null);
    expect(() => source?.load(new AbortController().signal)).toThrow();
  });
  it('queues a successful-command refresh while an earlier background read is pending', () => {
    const identity = signal<Session | null>({ ...sessionFixture, roles: ['super_admin'] });
    const responses: Subject<readonly TenantAdmin[]>[] = [];
    const all = vi.fn(() => {
      const response = new Subject<readonly TenantAdmin[]>();
      responses.push(response);
      return response.asObservable();
    });
    TestBed.configureTestingModule({
      providers: [
        AdminReadState,
        { provide: AuthSession, useValue: { readIdentity: identity } },
        { provide: TenantAdminService, useValue: { all } },
      ],
    });
    const reads = TestBed.inject(AdminReadState);
    TestBed.tick();
    responses[0]?.next([adminFixture]);
    reads.refresh();
    TestBed.tick();
    expect(all).toHaveBeenCalledTimes(2);
    reads.refresh();
    TestBed.tick();
    responses[1]?.next([adminFixture]);
    TestBed.tick();
    expect(all).toHaveBeenCalledTimes(3);
    responses[2]?.next([]);
    expect(reads.source().result?.rows).toEqual([]);
    identity.set(null);
    expect(reads.source().result).toBeUndefined();
    TestBed.tick();
  });
});
