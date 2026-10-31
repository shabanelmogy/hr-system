import type { ValidatorFn } from '@angular/forms';
import { reportFilterText, reportFilterLimit } from '../types/global-report';
export const reportFilterValidator: ValidatorFn = (control) =>
  reportFilterText.safeParse(control.value).success
    ? null
    : { maxlength: { requiredLength: reportFilterLimit } };
