import { Component, computed, inject, input } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  OptionSelect,
  SortDirectionButton,
} from '../../../../../../shared/ui/public-api';
import { DistrictReadState } from '../../state/district-read-state';
import { DistrictStatesState } from '../../state/district-states-state';
import { districtSortFields } from '../../types/district';
import { districtName } from '../../utils/district-presentation';
@Component({
  selector: 'erp-district-list-criteria',
  imports: [ActionButton, AppIcon, OptionSelect, SortDirectionButton, UiTextPipe],
  templateUrl: './district-list-criteria.html',
  styleUrl: './district-list-criteria.scss',
})
export class DistrictListCriteria {
  readonly showSort = input(false);
  readonly state = inject(DistrictReadState);
  readonly parents = inject(DistrictStatesState);
  readonly locale = inject(LocalizationRuntime);
  readonly statuses = computed(() =>
    ['active', 'archived', 'all'].map((value) => ({
      value,
      label: this.districtText('districts.status.' + value),
    })),
  );
  readonly sorts = computed(() =>
    districtSortFields.map((value) => ({ value, label: this.fieldLabel(value) })),
  );
  readonly stateOptions = computed(() => {
    const view = this.parents.view();
    const options =
      view.kind === 'ready'
        ? view.data.map((state) => ({
            value: String(state.id),
            label: districtName(state, this.locale.language()),
          }))
        : [];
    const selected = this.state.query().stateId;
    if (selected !== undefined && !options.some((option) => option.value === String(selected)))
      options.unshift({
        value: String(selected),
        label: this.districtText('districts.state') + ' #' + selected,
      });
    return [{ value: '', label: this.districtText('districts.allStates') }, ...options];
  });
  readonly addressOptions = computed(() => [
    { value: '', label: this.text('common.all') },
    { value: 'true', label: this.districtText('districts.hasAddresses') },
    { value: 'false', label: this.districtText('districts.withoutAddresses') },
  ]);
  chooseState(value: string): void {
    if (!value) {
      this.state.changeState(null);
      return;
    }
    const id = Number(value);
    if (/^[1-9]\d*$/.test(value) && this.parents.canSelect(id)) this.state.changeState(id);
  }
  chooseAddresses(value: string): void {
    if (value === '' || value === 'true' || value === 'false')
      this.state.changeHasAddresses(value === '' ? null : value === 'true');
  }
  chooseSort(value: string): void {
    if (districtSortFields.some((field) => field === value))
      this.state.changeSort({ field: value, direction: this.state.sort()?.direction ?? 'asc' });
  }

  text(key: string): string {
    return this.locale.translate(key);
  }
  districtText(key: string): string {
    return this.locale.translate(key, 'reference-districts');
  }
  fieldLabel(value: string): string {
    return value === 'id' || value === 'nameAr' || value === 'nameEn' || value === 'createdOn'
      ? this.text('general.' + value)
      : this.districtText('districts.' + value);
  }
}
