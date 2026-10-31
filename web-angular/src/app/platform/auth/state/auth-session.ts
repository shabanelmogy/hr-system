import { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { LocalizationService } from '../../localization/public-api';
import { BrowserAuthService } from '../services/browser-auth-service';
import { SessionContextEvents } from '../services/session-context-events';
import type { Challenge, Credentials, LoginResult, Session } from '../types/auth-contracts';
import { UnsavedChanges } from '../../../shared/data/public-api';

@Injectable({ providedIn: 'root' })
export class AuthSession {
  private readonly transport = inject(BrowserAuthService);
  private readonly localization = inject(LocalizationService);
  private readonly events = inject(SessionContextEvents);
  private readonly drafts = inject(UnsavedChanges);
  readonly user = signal<Session | null>(null);
  readonly challenge = signal<Challenge | null>(null);
  readonly pending = signal(false);
  readonly restoring = signal(false);
  readonly error = signal<string | null>(null);
  readonly contextChanging = signal(false);
  readonly contextError = signal<string|null>(null);
  readonly readIdentity = computed(()=>this.contextChanging()?null:this.user());
  private generation = 0;
  private restoreTask: Promise<void> | null = null;
  private visibleTask: Promise<void> | null = null;
  private queuedContextCheck = false;
  private destroyed = false;

  constructor(){
    const unsubscribe=this.events.subscribe(hint=>{
      if(hint==='external')this.drafts.cancel();
      if(hint==='visible'&&!this.user())return;
      if(this.pending()||this.restoring()){if(hint==='external')this.queuedContextCheck=true;return;}
      if(hint==='visible'){void this.revalidateVisibleContext();return;}
      void this.synchronizeContext();
    });
    inject(DestroyRef).onDestroy(()=>{this.destroyed=true;this.generation++;unsubscribe();});
  }

  restore(): Promise<void> {
    this.restoreTask ??= this.restoreSession();
    return this.restoreTask;
  }

  private async restoreSession(): Promise<void> {
    this.restoring.set(true); const generation = this.generation;
    try {
      const user=await this.currentSession();
      if(user)await this.acceptUser(user, generation);
    } catch (error) { if (generation === this.generation) this.error.set(this.message(error)); }
    finally { this.restoring.set(false); this.drainContextCheck(); }
  }

  private async currentSession():Promise<Session|null>{
    try{return await this.transport.session();}
    catch(error){
      if(!(error instanceof HttpErrorResponse)||error.status!==401)throw error;
      try{return await this.transport.refresh();}
      catch(refreshError){if(refreshError instanceof HttpErrorResponse&&[400,401].includes(refreshError.status))return null;throw refreshError;}
    }
  }

  async switchCompany(companyId:number):Promise<boolean>{
    const previous=this.user();
    if(this.pending()||this.restoring()||!previous||previous.roles.some(r=>r.trim().toLowerCase()==='super_admin')||!Number.isInteger(companyId)||companyId<=0||companyId===previous.companyId||!previous.companies.some(c=>c.id===companyId))return false;
    if(this.drafts.requiresDecision()){
      const stamp=this.drafts.stamp();
      if(!await this.drafts.request('company:'+companyId)||!this.drafts.matches(stamp)||this.user()!==previous||this.pending()||this.restoring())return false;
    }
    this.pending.set(true);this.contextChanging.set(true);this.contextError.set(null);
    const generation=++this.generation;void this.localization.connect(null);
    try{
      let verified:Session|null;
      try{verified=await this.transport.switchCompany(companyId);}
      catch{this.transport.resetCsrf();verified=await this.currentSession();}
      if(generation!==this.generation)return false;
      if(!verified){this.clearContext();this.error.set('angularAuth.unavailable');return false;}
      await this.acceptUser(verified,generation);
      const changed=this.user()?.companyId===companyId&&this.user()?.userId===previous.userId&&this.user()?.tenantId===previous.tenantId;
      if(!changed)this.contextError.set('auth.companySwitchFailed');
      return changed;
    }catch{
      if(generation===this.generation){this.clearContext();this.error.set('angularAuth.unavailable');}
      return false;
    }finally{
      this.contextChanging.set(false);this.pending.set(false);this.events.publish();this.drainContextCheck();
    }
  }

  /** A focus hint is not a scope change. Preserve the verified identity unless
   * the server reports a difference; external invalidations still mask at once. */
  revalidateVisibleContext():Promise<void>{
    if(this.visibleTask)return this.visibleTask;
    const previous=this.user(),generation=this.generation;
    if(!previous||this.pending()||this.restoring()||this.destroyed)return Promise.resolve();
    const current=()=>!this.destroyed&&generation===this.generation&&this.user()===previous&&!this.pending()&&!this.restoring();
    this.visibleTask=(async()=>{
      try{
        const verified=await this.currentSession();
        if(current()&&(!verified||!sameVerifiedSession(previous,verified)))await this.synchronizeContext();
      }catch{if(current())await this.synchronizeContext();}
    })().finally(()=>{this.visibleTask=null;});
    return this.visibleTask;
  }

  async synchronizeContext():Promise<boolean>{
    if(this.pending()||this.restoring()||this.destroyed)return false;
    this.drafts.cancel();
    this.pending.set(true);this.contextChanging.set(true);this.contextError.set(null);
    const generation=++this.generation;void this.localization.connect(null);this.transport.resetCsrf();
    try{
      const verified=await this.currentSession();
      if(generation!==this.generation)return false;
      if(verified){await this.acceptUser(verified,generation);return this.user()!==null;}
      this.clearContext();return false;
    }catch{
      if(generation===this.generation){this.clearContext();this.error.set('angularAuth.unavailable');}
      return false;
    }finally{this.contextChanging.set(false);this.pending.set(false);this.drainContextCheck();}
  }

  /** Serialize a module-owned context update; only the API may publish identity. */
  async runScopedContextUpdate(operation:()=>Promise<boolean>):Promise<boolean>{
    const previous=this.user();
    if(this.pending()||this.restoring()||!previous||previous.roles.some(r=>r.trim().toLowerCase()==='super_admin'))return false;
    if(this.drafts.requiresDecision()){
      const stamp=this.drafts.stamp();
      if(!await this.drafts.request('scoped-context')||!this.drafts.matches(stamp)||this.user()!==previous||this.pending()||this.restoring())return false;
    }
    this.pending.set(true);this.contextChanging.set(true);this.contextError.set(null);
    const generation=++this.generation;void this.localization.connect(null);
    try{
      const confirmed=await operation();
      const verified=await this.currentSession();
      if(generation!==this.generation)return false;
      if(!verified){this.clearContext();return false;}
      await this.acceptUser(verified,generation);
      if(confirmed)this.drafts.invalidate();
      return confirmed&&this.user()?.userId===previous.userId&&this.user()?.tenantId===previous.tenantId&&this.user()?.companyId===previous.companyId;
    }catch{
      if(generation===this.generation){this.clearContext();this.error.set('angularAuth.unavailable');}
      return false;
    }finally{this.contextChanging.set(false);this.pending.set(false);this.events.publish();this.drainContextCheck();}
  }

  private clearContext():void{this.drafts.invalidate();this.user.set(null);this.challenge.set(null);void this.localization.connect(null);}
  private drainContextCheck():void{
    if(!this.destroyed&&this.queuedContextCheck&&!this.pending()&&!this.restoring()){
      this.queuedContextCheck=false;queueMicrotask(()=>{if(!this.destroyed)void this.synchronizeContext();});
    }
  }

  login(credentials: Credentials): Promise<boolean> { return this.perform(() => this.transport.login(credentials)); }

  select(id: string): Promise<boolean> {
    const selection = this.challenge();
    if (!selection) return Promise.resolve(false);
    const expiration = 'requiresTenantSelection' in selection ? selection.tenantSelectionTokenExpiration : selection.companySelectionTokenExpiration;
    if (!Number.isFinite(Date.parse(expiration)) || Date.parse(expiration) <= Date.now()) {
      this.cancelSelection(); this.error.set('angularAuth.selectionExpired'); return Promise.resolve(false);
    }
    if ('requiresTenantSelection' in selection) {
      if (!selection.tenants.some(tenant => tenant.id === id)) return Promise.resolve(false);
      return this.perform(() => this.transport.selectTenant(selection.tenantSelectionToken, id));
    }
    const company = selection.companies.find(company => String(company.id) === id);
    return company ? this.perform(() => this.transport.selectCompany(selection.companySelectionToken, company.id)) : Promise.resolve(false);
  }

  cancelSelection(): void { if (!this.pending()) { this.generation++; this.challenge.set(null); } }

  private async perform(operation: () => Promise<LoginResult>): Promise<boolean> {
    if (this.pending()) return false;
    this.pending.set(true); this.error.set(null); this.contextError.set(null);
    try {
      await this.restoreTask;
      const generation = ++this.generation;
      void this.localization.connect(null); this.user.set(null);
      const result = await operation();
      if (generation !== this.generation) return false;
      if (result.isAuthenticated) { await this.acceptUser(result.user, generation); this.events.publish(); return this.user() !== null; }
      this.challenge.set(result); return false;
    } catch (error) { this.error.set(this.message(error)); return false; }
    finally { this.pending.set(false); this.drainContextCheck(); }
  }

  private async acceptUser(user: Session, generation: number): Promise<void> {
    if (generation !== this.generation) return;
    this.transport.resetCsrf();
    await this.transport.csrf();
    if (generation !== this.generation) return;
    await this.localization.connect({ userId: user.userId, tenantId: user.tenantId, companyId: user.companyId, roles: user.roles, permissions: user.permissions });
    if (generation !== this.generation) return;
    const previous=this.user();
    if(previous&&(previous.userId!==user.userId||previous.tenantId!==user.tenantId||previous.companyId!==user.companyId
      ||previous.tenantReadOnly!==user.tenantReadOnly||JSON.stringify([...previous.permissions].sort())!==JSON.stringify([...user.permissions].sort())
      ||JSON.stringify([...previous.roles].sort())!==JSON.stringify([...user.roles].sort())))this.drafts.invalidate();
    this.challenge.set(null); this.error.set(null); this.user.set(user);
  }

  async logout(): Promise<boolean> {
    if (this.pending()) return false;
    const previous=this.user();
    if(this.drafts.requiresDecision()){
      const stamp=this.drafts.stamp();
      if(!await this.drafts.request('logout')||!this.drafts.matches(stamp)||this.user()!==previous||this.pending()||this.restoring())return false;
    }
    this.pending.set(true); this.error.set(null);
    try { await this.transport.logout(); return true; }
    catch { this.error.set('angularAuth.logoutFailed'); return false; }
    finally {
      ++this.generation; this.drafts.invalidate(); void this.localization.connect(null); this.user.set(null); this.challenge.set(null);
      this.restoreTask = Promise.resolve(); this.pending.set(false);
      this.events.publish();this.drainContextCheck();
    }
  }

  private message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) return 'angularAuth.invalidCredentials';
      if (error.status === 429) return 'angularAuth.tooManyRequests';
      if (error.status === 0 || error.status >= 500 || error.status === 403) return 'angularAuth.unavailable';
    }
    return 'angularAuth.authenticationFailed';
  }
}

function sameVerifiedSession(left:Session,right:Session):boolean{
  const normalized=(session:Session)=>({...session,roles:[...session.roles].sort(),permissions:[...session.permissions].sort(),companies:[...session.companies].sort((a,b)=>a.id-b.id)});
  return JSON.stringify(normalized(left))===JSON.stringify(normalized(right));
}
