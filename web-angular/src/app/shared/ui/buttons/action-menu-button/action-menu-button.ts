import { Component, computed, effect, input, output, signal, viewChild } from '@angular/core';
import { Menu } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import AuraMenu from '@primeuix/themes/aura/menu';
import { AppIcon, type AppIconName } from '../../icons/app-icon/app-icon';
import { ActionButton } from '../action-button/action-button';

export interface ActionMenuItem<TAction extends string = string> {
  readonly id: TAction;
  readonly label: string;
  readonly icon?: AppIconName;
  readonly disabled?: boolean;
}

@Component({
  imports: [ActionButton, AppIcon, Menu],
  selector: 'erp-action-menu-button',
  styleUrl: './action-menu-button.scss',
  templateUrl: './action-menu-button.html',
})
export class ActionMenuButton<TAction extends string = string> {
  private static sequence = 0;
  readonly menuId = 'erp-action-menu-' + ++ActionMenuButton.sequence;
  readonly label = input.required<string>();
  readonly compactIcon = input<AppIconName | null>(null);
  readonly actions = input.required<readonly ActionMenuItem<TAction>[]>();
  readonly disabled = input(false);
  readonly activated = output<TAction>();
  readonly opened = signal(false);
  private readonly menu = viewChild(Menu);
  readonly tokens = {
    ...AuraMenu,
    root: {
      ...AuraMenu.root,
      background: 'var(--surface)',
      color: 'var(--foreground)',
      borderColor: 'var(--border)',
      borderRadius: '10px',
      shadow: '0 8px 24px #00000026',
    },
    list: { padding: '6px', gap: '2px' },
    item: {
      ...AuraMenu.item,
      color: 'var(--foreground)',
      focusColor: 'var(--accent-foreground)',
      focusBackground: 'var(--accent)',
      padding: '10px 12px',
      borderRadius: '6px',
    },
  };
  readonly model = computed<MenuItem[]>(() => {
    const actions = this.actions();
    if (new Set(actions.map((action) => action.id)).size !== actions.length) return [];
    return actions.map((action) => ({
      id: this.menuId + '-' + action.id,
      label: action.label,
      ...(action.icon === undefined ? {} : { icon: action.icon }),
      ...(action.disabled === undefined ? {} : { disabled: action.disabled }),
      command: () => this.activate(action.id),
    }));
  });
  constructor() {
    effect(() => {
      if (this.disabled() || !this.model().length) this.menu()?.hide();
    });
  }
  toggle(event: MouseEvent): void {
    if (!this.disabled() && this.model().length) this.menu()?.toggle(event);
  }
  private activate(id: TAction): void {
    if (
      !this.disabled() &&
      this.model().some((item) => item.id === this.menuId + '-' + id && !item.disabled)
    )
      this.activated.emit(id);
  }
}
