import { Component, computed, inject } from '@angular/core';
import { ActionButton, AppIcon, OptionSelect } from '../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../localization/public-api';
import { ModuleContextState, overviewApplication } from '../state/module-context-state';
import { moduleDefinitions } from '../presentation/module-registry';

@Component({ selector: 'erp-module-context', imports: [OptionSelect, ActionButton, AppIcon, UiTextPipe], template: `
  @if(context.visible()){
    <erp-option-select appearance="context" commitMode="external" icon="apps"
      [label]="'modules.currentApplication' | uiText" [menuLabel]="'modules.switchApplication' | uiText" [value]="context.value()" [options]="options()"
      [emptyLabel]="emptyLabel()" [invalid]="failed()" [busy]="context.busy() || context.catalog.state().kind==='loading'"
      [disabled]="context.busy() || context.catalog.state().kind!=='ready'"
      (valueChange)="context.select($event)" />
    @if(context.catalog.state().kind==='error'){
      <erp-button appearance="icon" variant="text" [label]="'actions.retry' | uiText" (activated)="context.catalog.retry()"><erp-icon buttonIcon name="history" /></erp-button>
    }
  }`, styles: ':host{display:flex;align-items:center;min-width:0;--context-accent:var(--primary)}' })
export class ModuleContextControl {
  readonly context = inject(ModuleContextState);
  private readonly locale = inject(LocalizationRuntime);
  readonly failed = computed(() => ['error', 'forbidden'].includes(this.context.catalog.state().kind));
  readonly options = computed(() => {
    const state = this.context.catalog.state();
    return state.kind === 'ready' ? [
      { value: overviewApplication, label: this.locale.translate('modules.overview'), description: this.locale.translate('modules.title'),icon:'apps' as const },
      ...state.modules.map(module => {
        const key = 'modules.' + module.code, caption = this.locale.translate(key);
        return { value: module.code, label: caption === key ? module.name : caption,icon:moduleDefinitions.find(definition=>definition.code===module.code)?.icon??'apps' as const };
      }),
    ] : [];
  });
  readonly emptyLabel = computed(() => {
    const kind = this.context.catalog.state().kind;
    return this.locale.translate(kind === 'loading' ? 'common.loading' : kind === 'error' ? 'common.error' : 'authorization.forbidden.title');
  });
}
