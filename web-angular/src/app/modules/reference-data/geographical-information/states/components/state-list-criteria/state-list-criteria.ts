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
import { StateReadState } from '../../state/state-read-state';
import { StateCountriesState } from '../../state/state-countries-state';
import { stateSortFields } from '../../types/state';
import { stateName } from '../../utils/state-presentation';
@Component({
  selector: 'erp-state-list-criteria',
  imports: [ActionButton, AppIcon, OptionSelect, SortDirectionButton, UiTextPipe],
  templateUrl: './state-list-criteria.html',
  styleUrl: './state-list-criteria.scss',
})
export class StateListCriteria {
  readonly showSort = input(false);
  readonly state = inject(StateReadState);
  readonly parents = inject(StateCountriesState);
  readonly locale = inject(LocalizationRuntime);
  readonly statuses = computed(() =>
    ['active', 'archived', 'all'].map((value) => ({
      value,
      label: this.stateText('states.status.' + value),
    })),
  );
  readonly sorts = computed(() =>
    stateSortFields.map((value) => ({ value, label: this.fieldLabel(value) })),
  );
  readonly countryOptions = computed(() => {
    const view = this.parents.view();
    const options =
      view.kind === 'ready'
        ? view.data.map((country) => ({
            value: String(country.id),
            label: stateName(country, this.locale.language()),
          }))
        : [];
    const selected = this.state.query().countryId;
    if (selected !== undefined && !options.some((option) => option.value === String(selected)))
      options.unshift({
        value: String(selected),
        label: this.stateText('states.country') + ' #' + selected,
      });
    return [{ value: '', label: this.stateText('states.allCountries') }, ...options];
  });
  readonly districtOptions = computed(() => [
    { value: '', label: this.text('common.all') },
    { value: 'true', label: this.stateText('states.hasDistricts') },
    { value: 'false', label: this.stateText('states.withoutDistricts') },
  ]);
  chooseCountry(value: string): void {
    if (!value) {
      this.state.changeCountry(null);
      return;
    }
    const id = Number(value);
    if (/^[1-9]\d*$/.test(value) && this.parents.canSelect(id)) this.state.changeCountry(id);
  }
  chooseDistricts(value: string): void {
    if (value === '' || value === 'true' || value === 'false')
      this.state.changeHasDistricts(value === '' ? null : value === 'true');
  }
  chooseSort(value: string): void {
    if (stateSortFields.some((field) => field === value))
      this.state.changeSort({ field: value, direction: this.state.sort()?.direction ?? 'asc' });
  }

  text(key: string): string {
    return this.locale.translate(key);
  }
  stateText(key: string): string {
    return this.locale.translate(key, 'reference-states');
  }
  fieldLabel(value: string): string {
    return value === 'id' || value === 'nameAr' || value === 'nameEn' || value === 'createdOn'
      ? this.text('general.' + value)
      : this.stateText('states.' + value);
  }
}
