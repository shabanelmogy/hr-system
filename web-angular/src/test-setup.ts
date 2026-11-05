import { beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideAppLocalization } from './app/platform/localization/public-api';

beforeEach(() => {
  TestBed.configureTestingModule({ providers: [provideAppLocalization()] });
});
