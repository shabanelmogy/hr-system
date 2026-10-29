import { Component, input } from '@angular/core';
import { AppIcon, type AppIconName } from '../icons/app-icon';

@Component({ selector: 'erp-context-badge', imports: [AppIcon], template: `
  <span class="context-badge" [title]="label() + ': ' + value()" role="img" [attr.aria-label]="label() + ': ' + value()">
    <span class="context-icon"><erp-icon [name]="icon()" /></span><span class="context-value">{{ value() }}</span>
  </span>`, styles: `
    :host{display:block;min-width:0}.context-badge{display:flex;align-items:center;gap:8px;padding:4px 8px;min-width:0;max-width:240px;color:var(--foreground)}
    .context-icon{display:grid;place-items:center;width:28px;height:28px;border-radius:8px;flex-shrink:0;background:var(--accent);color:var(--context-accent,var(--primary))}
    .context-icon erp-icon{width:18px;height:18px}.context-value{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    @media(max-width:1199px){.context-value{display:none}.context-badge{padding:2px;gap:0}}
    @container (max-width:1199px){.context-value{display:none}.context-badge{padding:2px;gap:0}}
  ` })
export class ContextBadge { readonly label = input.required<string>(); readonly value = input.required<string>(); readonly icon = input.required<AppIconName>(); }
