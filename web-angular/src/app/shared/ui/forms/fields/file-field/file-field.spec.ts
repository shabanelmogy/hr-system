import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAppTheme } from '../../../../../../theme/public-api';
import { FileField } from './file-field';

describe('shared PrimeNG file field', () => {
  afterEach(() => TestBed.resetTestingModule());
  it('opts into the native dropzone while keeping service-owned uploads and read-only guards', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideAppTheme()] });
    const fixture = TestBed.createComponent(FileField);
    fixture.componentRef.setInput('label', 'Image');
    fixture.componentRef.setInput('chooseLabel', 'Choose image');
    fixture.componentRef.setInput('clearLabel', 'Clear image');
    fixture.componentRef.setInput('dropzone', true);
    fixture.componentRef.setInput('dropLabel', 'Drop image here');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.p-fileupload-content')).not.toBeNull();
    expect(root.textContent).toContain('Drop image here');
    expect(root.querySelector('.p-fileupload-upload-button')).toBeNull();
    fixture.componentRef.setInput('readOnly', true);
    await fixture.whenStable();
    fixture.componentInstance.select({
      originalEvent: new Event('drop'),
      files: [new File(['a'], 'a.png')],
      currentFiles: [],
    });
    expect(fixture.componentInstance.value()).toBeNull();
  });
  it('selects and clears File objects without performing an upload', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideAppTheme()] });
    const fixture = TestBed.createComponent(FileField);
    fixture.componentRef.setInput('label', 'Report source');
    fixture.componentRef.setInput('chooseLabel', 'Choose report');
    fixture.componentRef.setInput('clearLabel', 'Clear report');
    await fixture.whenStable();
    const changed = vi.fn();
    fixture.componentInstance.registerOnChange(changed);
    const file = new File(['fixture'], 'Countries.rpt');
    fixture.componentInstance.select({
      originalEvent: new Event('change'),
      files: [file],
      currentFiles: [file],
    });
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith(file);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Countries.rpt');
    fixture.componentInstance.clear();
    await fixture.whenStable();
    expect(changed).toHaveBeenLastCalledWith(null);
    expect(fixture.componentInstance.value()).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('p-fileupload')).not.toBeNull();
  });
});
