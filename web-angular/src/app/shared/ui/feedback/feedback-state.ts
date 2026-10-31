import { Component, input, output } from '@angular/core';
import { ActionButton } from '../buttons/public-api';
import { AppIcon,type AppIconName } from '../icons/app-icon';

@Component({ selector: 'erp-feedback-state', imports: [ActionButton, AppIcon], template: `
  <section [attr.role]="kind()==='error'||kind()==='forbidden'?'alert':'status'" [attr.aria-busy]="kind()==='loading'" [attr.aria-label]="title()">
    @if(kind()==='loading'){<span class="spinner" aria-hidden="true"></span>}
    @else {<erp-icon [name]="icon()??(kind()==='forbidden'?'lock':kind()==='error'?'close':'apps')" />}
    @if(layout()==='inline'){<strong>{{ title() }}</strong>}@else{<h1>{{ title() }}</h1>}@if(message()){<p>{{ message() }}</p>}
    @if(actionLabel()){<erp-button [label]="actionLabel()" variant="outlined" (activated)="action.emit()" />}
  </section>`,host:{'[class.inline-feedback]':"layout()==='inline'",'[class.compact-feedback]':'compact()'}, styles: `
  :host{display:block}section{display:flex;flex-direction:column;align-items:center;text-align:center;padding:64px 16px;gap:16px}
  erp-icon{inline-size:58px;block-size:58px;color:var(--muted-foreground)}h1{font-size:24px;line-height:1.4;margin:0;font-weight:800;overflow-wrap:anywhere}
  p{margin:0;max-width:560px;color:var(--muted-foreground);overflow-wrap:anywhere}.spinner{inline-size:40px;block-size:40px;border:3px solid var(--border);border-block-start-color:var(--primary);border-radius:50%;animation:spin 800ms linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.spinner{animation:none}}
  :host(.compact-feedback) section{padding:16px;gap:8px}:host(.compact-feedback) erp-icon{width:40px;height:40px}:host(.compact-feedback) h1{font-size:20px}
  :host(.inline-feedback){margin-bottom:12px}:host(.inline-feedback) section{flex-direction:row;text-align:start;padding:12px 16px;gap:12px;border:1px solid color-mix(in srgb,var(--destructive) 30%,transparent);border-radius:8px;background:color-mix(in srgb,var(--destructive) 5%,var(--surface))}:host(.inline-feedback) erp-icon{width:24px;height:24px;color:var(--destructive)}:host(.inline-feedback) strong{flex:1;font-size:14px;overflow-wrap:anywhere}
  ` })
export class FeedbackState {
  readonly compact=input(false);readonly icon=input<AppIconName|null>(null);
  readonly kind = input<'loading'|'empty'|'error'|'forbidden'>('empty');
  readonly title = input.required<string>(); readonly message = input(''); readonly actionLabel = input(''); readonly action = output<void>();
  readonly layout=input<'page'|'inline'>('page');
}
