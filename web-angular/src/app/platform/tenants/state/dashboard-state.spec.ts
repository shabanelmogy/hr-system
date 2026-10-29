import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController,provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthSession,type Session } from '../../auth/session.public-api';
import { sessionFixture } from '../../auth/auth.fixture';
import { dashboardFixture } from '../dashboard.fixture';
import { DashboardState } from './dashboard-state';
import { ERP_API_ORIGIN } from '../../../config/api-origin';
describe('Global summary read authority',()=>{
  const url='https://localhost:7037/api/v1/tenants/getDashboardSummary';
  it('refuses ordinary users without a request and clears a global result on role/session replacement',()=>{
    const user=signal<Session|null>(sessionFixture);
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting(),{provide:ERP_API_ORIGIN,useValue:'https://localhost:7037'},DashboardState,{provide:AuthSession,useValue:{user,readIdentity:user}}]});
    const state=TestBed.inject(DashboardState),http=TestBed.inject(HttpTestingController);TestBed.tick();expect(state.state()).toEqual({kind:'forbidden'});http.expectNone(url);
    user.set({...sessionFixture,roles:[' SUPER_ADMIN ']});TestBed.tick();const request=http.expectOne(url);expect(request.request.withCredentials).toBe(true);expect(request.request.headers.has('Authorization')).toBe(false);request.flush(dashboardFixture);expect(state.state().kind).toBe('ready');
    user.set(sessionFixture);expect(state.state()).toEqual({kind:'forbidden'});TestBed.tick();http.expectNone(url);http.verify();
  });
});
