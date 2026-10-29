import { TestBed } from '@angular/core/testing';
import { getTheme, themePaletteOrder, type ThemePalette } from '@app/tokens';
import { PalettePicker } from './palette-picker';

describe('Shared native-radio palette selection',()=>{
  function setup(){const f=TestBed.createComponent(PalettePicker);f.componentRef.setInput('label','Palette');f.componentRef.setInput('labels',Object.fromEntries(themePaletteOrder.map(v=>[v,v])));f.componentRef.setInput('value','green');f.componentRef.setInput('mode','light');return f;}
  it('uses one native radio group and emits a valid user choice without changing controlled state',async()=>{
    const f=setup();await f.whenStable();const root=f.nativeElement as HTMLElement;const radios=[...root.querySelectorAll<HTMLInputElement>('input')];
    expect(radios).toHaveLength(5);expect(new Set(radios.map(r=>r.name)).size).toBe(1);expect(radios.find(r=>r.checked)?.value).toBe('green');
    const selected=vi.fn();f.componentInstance.valueChange.subscribe(selected);const blue=radios.find(r=>r.value==='blue')!;blue.checked=true;blue.dispatchEvent(new Event('change'));
    expect(selected).toHaveBeenCalledExactlyOnceWith('blue');expect(f.componentInstance.value()).toBe('green');
    f.componentRef.setInput('value','blue');await f.whenStable();expect(root.querySelector('.selected input')?.getAttribute('value')).toBe('blue');
  });
  it('isolates radio groups between instances and refreshes swatches for dark mode',async()=>{
    const first=setup(),second=setup();await first.whenStable();await second.whenStable();expect(first.componentInstance.groupName).not.toBe(second.componentInstance.groupName);
    first.componentRef.setInput('mode','dark');await first.whenStable();
    expect(first.componentInstance.options().find(p=>p.value==='green')?.colors.primary).toBe(getTheme('green','dark').colors.primary);
    expect(first.componentInstance.options().map(p=>p.value)).toEqual(themePaletteOrder as readonly ThemePalette[]);
  });
});
