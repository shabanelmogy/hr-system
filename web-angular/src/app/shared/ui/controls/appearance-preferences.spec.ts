import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideAppTheme } from '../../../../theme/public-api';
import { AppearancePreferences } from './appearance-preferences';
import { OptionSelect } from './option-select';
import { ActionButton } from '../buttons/public-api';

describe('Controlled shared appearance preferences', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideAppTheme()] }));

  it('emits typed changes through shared controls and waits for the owner to commit', async () => {
    const fixture = TestBed.createComponent(AppearancePreferences);
    fixture.componentRef.setInput('language', 'en');
    fixture.componentRef.setInput('mode', 'light');
    const language = vi.fn(), mode = vi.fn();
    fixture.componentInstance.languageChange.subscribe(language);
    fixture.componentInstance.modeChange.subscribe(mode);
    await fixture.whenStable();
    const select = fixture.debugElement.query(By.directive(OptionSelect)).componentInstance as OptionSelect;
    select.valueChange.emit('ar');
    select.valueChange.emit('unsupported');
    fixture.debugElement.query(By.directive(ActionButton)).componentInstance.activated.emit();
    expect(language).toHaveBeenCalledExactlyOnceWith('ar');
    expect(mode).toHaveBeenCalledExactlyOnceWith('dark');
    expect(fixture.componentInstance.language()).toBe('en');
    expect(fixture.componentInstance.mode()).toBe('light');
    fixture.componentRef.setInput('language', 'ar');
    fixture.componentRef.setInput('mode', 'dark');
    await fixture.whenStable();
    expect(select.value()).toBe('ar');
    fixture.componentInstance.toggleMode();
    expect(mode).toHaveBeenLastCalledWith('light');
    expect(language).toHaveBeenCalledOnce();
  });
});
