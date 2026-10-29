import { computed,effect,inject,Injectable,signal,untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthSession,type Session } from '../../../../platform/auth/session.public-api';
import { createScopedRead } from '../../../../shared/data/public-api';
import { FiscalContextService } from '../services/fiscal-context-service';
import type { FiscalContext } from '../types/fiscal-context';
export const fiscalContextAllowed=(user:Session|null)=>!!user&&user.permissions.includes('FiscalYears:View')&&!user.roles.some(r=>r.trim().toLowerCase()==='super_admin');
const sameScope=(a:Session|null,b:Session|null)=>!!a&&!!b&&a.userId===b.userId&&a.tenantId===b.tenantId&&a.companyId===b.companyId;
@Injectable()
export class FiscalContextState {
  private readonly auth=inject(AuthSession);private readonly service=inject(FiscalContextService);
  private readonly read=createScopedRead(this.auth.readIdentity,fiscalContextAllowed,()=>this.service.read());
  private readonly snapshot=signal<{user:Session;data:FiscalContext}|null>(null);
  private readonly failure=signal<string|null>(null);readonly error=this.failure.asReadonly();readonly visible=computed(()=>fiscalContextAllowed(this.auth.user()));
  readonly state=this.read.state;
  readonly context=computed(()=>{const s=this.read.state();if(!this.visible())return null;if(s.kind==='ready')return s.data;const previous=this.snapshot();return previous&&sameScope(previous.user,this.auth.user())?previous.data:null;});
  constructor(){effect(()=>{const state=this.read.state(),user=this.auth.readIdentity(),header=this.auth.user();untracked(()=>{if(state.kind==='ready'&&user)this.snapshot.set({user,data:state.data});if(this.snapshot()&&!sameScope(this.snapshot()!.user,header)){this.snapshot.set(null);this.failure.set(null);}});});}
  clearError(){this.failure.set(null);}
  retry(){this.read.retry();}
  async select(id:number):Promise<boolean>{
    const user=this.auth.readIdentity(),current=this.context();
    if(!user||!fiscalContextAllowed(user)||this.auth.pending()||!current||id===current.selectedFiscalYear?.id||!current.availableFiscalYears.some(y=>y.id===id))return false;
    this.failure.set(null);let verified:FiscalContext|null=null;
    const accepted=await this.auth.runScopedContextUpdate(async()=>{
      try{verified=await this.service.select(id);}catch{verified=await firstValueFrom(this.service.read());}
      return verified.selectedFiscalYear?.id===id;
    });
    if(sameScope(user,this.auth.user())&&verified){this.snapshot.set({user:this.auth.user()!,data:verified});if(!accepted)this.failure.set('fiscalYears.context.switchError');}
    return accepted;
  }
}
