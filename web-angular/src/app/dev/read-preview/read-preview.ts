import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { themePaletteOrder } from '@app/tokens';
import { ThemeService } from '../../../theme/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../platform/localization/public-api';
import { createScopedRead } from '../../shared/data/public-api';
import {
  ActionButton,
  FeedbackState,
  OptionSelect,
  PageHeader,
  StatusBadge,
  SurfaceCard,
} from '../../shared/ui/public-api';
import { ReadPreviewProbe, type ReadIdentity, type ReadScenario } from '../read-preview-probe';
@Component({
  imports: [
    ActionButton,
    FeedbackState,
    OptionSelect,
    PageHeader,
    StatusBadge,
    SurfaceCard,
    UiTextPipe,
  ],
  templateUrl: './read-preview.html',
  styleUrl: './read-preview.scss',
})
export class ReadPreview {
  readonly runtime = inject(LocalizationRuntime);
  readonly theme = inject(ThemeService);
  readonly probe = inject(ReadPreviewProbe);
  readonly palettes = themePaletteOrder;
  private readonly router = inject(Router);
  readonly identity = signal<ReadIdentity | null>({ scope: 'a', allowed: true, epoch: 0 });
  readonly scenario = signal<ReadScenario>('ready');
  readonly slow = signal(false);
  readonly read = createScopedRead(
    this.identity,
    (user) => user.allowed,
    (user) => this.probe.load(user),
  );
  readonly snapshot = computed(() => {
    const state = this.read.state();
    return state.kind === 'ready' ? JSON.stringify(state.data) : '';
  });
  readonly scenarios = computed(() => [
    { value: 'ready', label: this.runtime.translate('common.success') },
    { value: 'error', label: this.runtime.translate('common.error') },
    { value: 'empty', label: this.runtime.translate('common.noOptionsFound') },
    { value: 'throw', label: this.runtime.translate('common.warning') },
    { value: 'forbidden', label: this.runtime.translate('authorization.forbidden.title') },
  ]);
  private lastScope: 'a' | 'b' = 'a';
  private epoch = 0;
  constructor() {
    void this.runtime.loadNamespace('core');
    this.probe.hints$.pipe(takeUntilDestroyed()).subscribe((hint) => {
      const identity = this.identity();
      if (identity?.allowed && hint.scope === identity.scope) this.read.invalidate();
    });
  }
  chooseScenario(value: string) {
    if (
      value === 'ready' ||
      value === 'error' ||
      value === 'empty' ||
      value === 'throw' ||
      value === 'forbidden'
    ) {
      this.scenario.set(value);
      this.probe.scenario = value;
    }
  }
  hint(foreign = false) {
    const scope = this.identity()?.scope ?? this.lastScope;
    this.probe.hint(foreign ? (scope === 'a' ? 'b' : 'a') : scope);
  }
  switchScope() {
    this.lastScope = (this.identity()?.scope ?? this.lastScope) === 'a' ? 'b' : 'a';
    this.identity.set({ scope: this.lastScope, allowed: true, epoch: ++this.epoch });
  }
  togglePermission() {
    const current = this.identity();
    if (current) this.identity.set({ ...current, allowed: !current.allowed, epoch: ++this.epoch });
  }
  toggleSession() {
    const current = this.identity();
    if (current) {
      this.lastScope = current.scope;
      this.identity.set(null);
    } else this.renew();
  }
  renew() {
    this.identity.set({
      scope: this.identity()?.scope ?? this.lastScope,
      allowed: true,
      epoch: ++this.epoch,
    });
  }
  toggleWait() {
    this.slow.update((v) => !v);
    this.probe.delayMs = this.slow() ? 900 : 180;
  }
  leave() {
    void this.router.navigateByUrl('/dev/reads-away');
  }
}
