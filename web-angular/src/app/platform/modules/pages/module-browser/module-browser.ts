import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { contrastRatio } from '@app/tokens';
import {
  PageHeader,
  FeedbackState,
  LauncherGrid,
  type LauncherItem,
} from '../../../../shared/ui/public-api';
import { ThemeService } from '../../../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../localization/public-api';
import { ModuleCatalogState } from '../../state/module-catalog-state';
import { areaPath, moduleDefinitions, modulePath } from '../../presentation/module-registry';

@Component({
  imports: [PageHeader, FeedbackState, LauncherGrid, UiTextPipe],
  templateUrl: './module-browser.html',
  styleUrl: './module-browser.scss',
})
export class ModuleBrowser {
  readonly catalog = inject(ModuleCatalogState);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly params = toSignal(this.route.paramMap, { requireSync: true });
  readonly locale = inject(LocalizationRuntime);
  private readonly theme = inject(ThemeService);
  readonly moduleCode = computed(() => this.params().get('moduleCode')?.toLowerCase() ?? '');
  readonly areaCode = computed(() => this.params().get('submoduleCode')?.toLowerCase() ?? '');
  readonly module = computed(() => {
    const state = this.catalog.state();
    return state.kind === 'ready'
      ? state.modules.find((m) => m.code === this.moduleCode())
      : undefined;
  });
  readonly area = computed(() => this.module()?.submodules.find((a) => a.code === this.areaCode()));
  readonly definition = computed(
    () => moduleDefinitions.find((d) => d.code === this.moduleCode()) ?? moduleDefinitions[0],
  );
  readonly denied = computed(
    () =>
      this.catalog.state().kind === 'ready' &&
      Boolean(this.moduleCode()) &&
      (!this.module() || (Boolean(this.areaCode()) && !this.area())),
  );
  readonly title = computed(() =>
    this.area()
      ? this.label(
          'modules.submodules.' + this.moduleCode() + '.' + this.areaCode(),
          this.area()?.name ?? '',
        )
      : this.module()
        ? this.label('modules.' + this.moduleCode(), this.module()?.name ?? '')
        : this.locale.translate('modules.title'),
  );
  readonly backLabel = computed(() =>
    this.locale.translate(
      this.areaCode() ? 'actions.back' : this.moduleCode() ? 'modules.overview' : 'general.home',
    ),
  );
  readonly items = computed<readonly LauncherItem[]>(() => {
    const state = this.catalog.state();
    if (state.kind !== 'ready') return [];
    const definition = this.definition();
    if (!definition) return [];
    const theme = this.theme.theme();
    if (this.moduleCode())
      return (this.module()?.submodules ?? []).map((area) => {
        const presentation = definition.areas.find((item) => item.code === area.code);
        const accent = presentation
          ? theme.colors[presentation.tone === 'secondary' ? 'brand2' : presentation.tone]
          : theme.modules[definition.color];
        return {
          id: area.code,
          label: this.label('modules.submodules.' + this.moduleCode() + '.' + area.code, area.name),
          href: areaPath(this.moduleCode(), area.code),
          icon: presentation?.icon ?? definition.icon,
          accent,
          contrast: this.contrast(accent),
          eyebrow: area.code.replaceAll('-', ' '),
        };
      });
    return state.modules.map((module) => {
      const d = moduleDefinitions.find((item) => item.code === module.code) ?? definition;
      const accent = theme.modules[d.color];
      return {
        id: module.code,
        label: this.label('modules.' + module.code, module.name),
        href: modulePath(module.code),
        icon: d.icon,
        accent,
        contrast: this.contrast(accent),
        eyebrow: module.code.toUpperCase(),
      };
    });
  });
  constructor() {
    void this.locale.loadNamespace('core');
  }
  private label(key: string, fallback: string): string {
    const value = this.locale.translate(key);
    return value === key ? fallback : value;
  }
  private contrast(accent: string): string {
    return contrastRatio(accent, '#FFFFFF') >= contrastRatio(accent, '#000000')
      ? '#FFFFFF'
      : '#000000';
  }
  back(): void {
    void this.router.navigateByUrl(
      this.areaCode() ? modulePath(this.moduleCode()) : this.moduleCode() ? '/apps' : '/home',
    );
  }
}
