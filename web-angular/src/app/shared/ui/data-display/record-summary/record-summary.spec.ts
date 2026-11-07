import { TestBed } from '@angular/core/testing';
import { RecordSummary } from './record-summary';

describe('Shared record summary and labeled metadata', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('offers compact labeled metadata without adding an empty title or changing default density', async () => {
    const fixture = TestBed.createComponent(RecordSummary);
    fixture.componentRef.setInput('title', '');
    fixture.componentRef.setInput('density', 'compact');
    fixture.componentRef.setInput('fields', [{ id: 'service', label: 'Service', value: 'Worker' }]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.classList.contains('compact')).toBe(true);
    expect(root.querySelector('strong')).toBeNull();
    expect(root.querySelector('dt')?.textContent).toBe('Service');
    expect(root.querySelector('dd')?.textContent).toBe('Worker');
  });

  it('preserves existing summary output and omits the optional field list by default', async () => {
    const fixture = TestBed.createComponent(RecordSummary);
    fixture.componentRef.setInput('title', 'Record');
    fixture.componentRef.setInput('description', 'Description');
    fixture.componentRef.setInput('metadata', 'Existing metadata');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('strong')?.textContent).toBe('Record');
    expect(root.querySelector('span')?.textContent).toBe('Description');
    expect(root.querySelector('small')?.textContent).toBe('Existing metadata');
    expect(root.querySelector('dl')).toBeNull();
  });

  it('renders each translated label and textual snapshot in semantic fields without interpreting markup', async () => {
    const fixture = TestBed.createComponent(RecordSummary);
    fixture.componentRef.setInput('title', 'History');
    fixture.componentRef.setInput('fields', [
      { id: 'module', label: 'Module', value: 'Reference data' },
      { id: 'key', label: 'Record key', value: '<script>text only</script>' },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect([...root.querySelectorAll('dt')].map((element) => element.textContent)).toEqual([
      'Module',
      'Record key',
    ]);
    expect([...root.querySelectorAll('dd')].map((element) => element.textContent)).toEqual([
      'Reference data',
      '<script>text only</script>',
    ]);
    expect(root.querySelector('script')).toBeNull();
  });

  it('preserves owner-supplied direction, full-width choice and stable field updates', async () => {
    const fixture = TestBed.createComponent(RecordSummary);
    fixture.componentRef.setInput('title', 'History');
    fixture.componentRef.setInput('fields', [
      { id: 'id', label: 'Identifier', value: 'abc', direction: 'ltr', fullWidth: true },
    ]);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const field = root.querySelector('dd');
    expect(field?.getAttribute('dir')).toBe('ltr');
    expect(field?.parentElement?.classList.contains('full-width')).toBe(true);
    fixture.componentRef.setInput('fields', [{ id: 'id', label: 'المعرف', value: 'جديد' }]);
    await fixture.whenStable();
    expect(root.querySelector('dd')).toBe(field);
    expect(field?.textContent).toBe('جديد');
    expect(field?.getAttribute('dir')).toBe('auto');
    expect(field?.parentElement?.classList.contains('full-width')).toBe(false);
  });
});
