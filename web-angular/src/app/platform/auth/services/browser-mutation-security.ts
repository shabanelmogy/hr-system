import { inject,Injectable } from '@angular/core';
import { BrowserAuthService } from './browser-auth-service';
/** Narrow authenticated API for module writes; the auth transport owns renewal. */
@Injectable({providedIn:'root'})
export class BrowserMutationSecurity {
 private readonly transport=inject(BrowserAuthService);
 csrf(renew=false):Promise<string>{if(renew)this.transport.resetCsrf();return this.transport.csrf();}
}
