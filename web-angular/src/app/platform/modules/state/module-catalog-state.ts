import { computed, inject, Injectable } from '@angular/core';
import { createScopedRead } from '../../../shared/data/public-api';
import { AuthSession } from '../../auth/session.public-api';
import { ModuleCatalogService } from '../services/module-catalog-service';
import { knownModules } from '../presentation/module-registry';
import { tenantWorkspaceAllowed } from '../presentation/module-access';
@Injectable()
export class ModuleCatalogState {
  private readonly service=inject(ModuleCatalogService);
  private readonly read=createScopedRead(inject(AuthSession).readIdentity,tenantWorkspaceAllowed,()=>this.service.accessible());
  readonly state=computed(()=>{const state=this.read.state();return state.kind==='ready'?{kind:'ready' as const,modules:knownModules(state.data)}:state;});
  retry():void{this.read.retry();}
}
