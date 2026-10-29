import { Component, computed, input } from '@angular/core';

@Component({ selector: 'erp-identity-avatar', template: '<span [title]="name()" role="img" [attr.aria-label]="name()">{{ initials() }}</span>',
  styles: ':host{display:inline-flex;flex-shrink:0;padding:4px}span{width:32px;height:32px;display:grid;place-items:center;border-radius:50%;background:var(--primary);color:var(--primary-foreground);font-size:12px;font-weight:700;box-shadow:0 0 0 2px var(--surface)}' })
export class IdentityAvatar {
  readonly name = input.required<string>();
  readonly initials = computed(() => this.name().trim().split(/\s+/).filter(Boolean).slice(0,2).map(part => part.charAt(0)).join('').toUpperCase() || 'U');
}
