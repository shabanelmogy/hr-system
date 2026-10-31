import { Component,computed,input } from '@angular/core';
import { Badge } from 'primeng/badge';
import AuraBadge from '@primeuix/themes/aura/badge';

/** Lazy native presentation for the existing TextField counter; it never trims data. */
@Component({selector:'erp-character-count-badge',imports:[Badge],template:`<p-badge [value]="count()+'/'+limit()" [severity]="severity()" [dt]="tokens" />`,styles:':host{display:inline-flex;align-items:center}'})
export class CharacterCountBadge {
 readonly count=input.required<number>();readonly limit=input.required<number>();
 readonly severity=computed((): 'secondary'|'warn'|'danger'=>this.count()>this.limit()?'danger':this.count()===this.limit()?'warn':'secondary');
 private readonly colors={secondary:{background:'color-mix(in srgb,var(--primary) 10%,var(--surface))',color:'var(--primary)'},warn:{background:'var(--warning)',color:'var(--warning-foreground)'},danger:{background:'var(--destructive)',color:'var(--destructive-foreground)'}};
 readonly tokens={...AuraBadge,root:{...AuraBadge.root,borderRadius:'7px',fontSize:'12px',fontWeight:'600',minWidth:'3rem',height:'24px',padding:'0 8px'},...this.colors,colorScheme:{light:this.colors,dark:this.colors}};
}
