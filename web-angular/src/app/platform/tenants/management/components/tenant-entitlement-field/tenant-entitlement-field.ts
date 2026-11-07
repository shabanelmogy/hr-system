import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';
import {
  ActionButton,
  AppIcon,
  BooleanField,
  FormFieldControl,
} from '../../../../../shared/ui/public-api';
import type { TenantEntitlementModule } from '../../../../modules/entitlements.public-api';
import type { TenantEntitlementDraft } from '../../validation/tenant-mutation';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';

/** A domain-specific grant picker using shared field lifecycle and shared boolean controls. */
@Component({
  selector: 'erp-tenant-entitlement-field',
  imports: [ActionButton, AppIcon, BooleanField],
  providers: [{ provide: FormFieldControl, useExisting: forwardRef(() => TenantEntitlementField) }],
  templateUrl: './tenant-entitlement-field.html',
  styleUrl: './tenant-entitlement-field.scss',
})
export class TenantEntitlementField extends FormFieldControl<readonly TenantEntitlementDraft[]> {
  readonly value = model<readonly TenantEntitlementDraft[]>([]);
  readonly modules = input.required<readonly TenantEntitlementModule[]>();
  readonly captions = inject(TenantFormPresentation);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly enabledCount = computed(() => this.value().length);
  readonly selectedModule = signal('');
  readonly current = computed(
    () =>
      this.modules().find((module) => module.code === this.selectedModule()) ??
      this.modules()[0] ??
      null,
  );
  readonly summary = computed(() =>
    this.captions.locale.translate('tenantManagement.enabledModulesCount', 'platform-tenants', {
      enabled: this.enabledCount(),
      total: this.modules().length,
    }),
  );
  moduleLabel(module: TenantEntitlementModule): string {
    return this.labelOrFallback('modules.' + module.code, module.name);
  }
  areaLabel(module: TenantEntitlementModule, code: string, fallback: string): string {
    return this.labelOrFallback('modules.submodules.' + module.code + '.' + code, fallback);
  }
  private labelOrFallback(key: string, fallback: string): string {
    const text = this.captions.locale.translate(key);
    return text === key ? fallback : text;
  }
  enabled(code: string): boolean {
    return this.value().some((entry) => entry.moduleCode === code);
  }
  selected(module: string, code: string): boolean {
    return this.value().some(
      (entry) => entry.moduleCode === module && entry.submoduleCodes.includes(code),
    );
  }
  chooseModule(module: TenantEntitlementModule, enabled: boolean): void {
    if (!this.modules().includes(module)) return;
    const existing = this.value().find((entry) => entry.moduleCode === module.code);
    const others = this.value().filter((entry) => entry.moduleCode !== module.code);
    this.accept(
      enabled
        ? [
            ...others,
            existing ?? {
              moduleCode: module.code,
              submoduleCodes: module.submodules.map((area) => area.code),
            },
          ]
        : others,
    );
    this.blur();
  }
  chooseArea(module: TenantEntitlementModule, code: string, enabled: boolean): void {
    if (!this.modules().includes(module) || !module.submodules.some((area) => area.code === code))
      return;
    this.accept(
      this.value().map((entry) =>
        entry.moduleCode !== module.code
          ? entry
          : {
              ...entry,
              submoduleCodes: enabled
                ? [...new Set([...entry.submoduleCodes, code])]
                : entry.submoduleCodes.filter((value) => value !== code),
            },
      ),
    );
    this.blur();
  }
  writeValue(value: unknown): void {
    if (!Array.isArray(value)) {
      this.value.set([]);
      return;
    }
    const entries: TenantEntitlementDraft[] = [];
    const input: readonly unknown[] = value;
    for (const entry of input) {
      if (
        typeof entry !== 'object' ||
        entry === null ||
        !('moduleCode' in entry) ||
        typeof entry.moduleCode !== 'string' ||
        !('submoduleCodes' in entry) ||
        !Array.isArray(entry.submoduleCodes)
      )
        return;
      const codes: string[] = [];
      const submodules: readonly unknown[] = entry.submoduleCodes;
      for (const code of submodules) {
        if (typeof code !== 'string') return;
        codes.push(code);
      }
      entries.push({ moduleCode: entry.moduleCode, submoduleCodes: codes });
    }
    this.value.set(entries);
  }
  focus(): void {
    this.host.nativeElement.querySelector<HTMLInputElement>('input')?.focus();
  }
}
