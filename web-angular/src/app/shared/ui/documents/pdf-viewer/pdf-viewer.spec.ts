import { TestBed } from '@angular/core/testing';
import { LocalizationRuntime } from '../../../../platform/localization/public-api';
import { provideAppTheme, ThemeService } from '../../../../../theme/public-api';
import { validatePdfDocument } from '../../../data/public-api';
import { PdfViewer } from './pdf-viewer';

describe('Shared PDF resource lease', () => {
  beforeEach(async () => {
    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn(() => 'blob:https://fixture.test/document'),
        revokeObjectURL: vi.fn(),
      }),
    );
    TestBed.configureTestingModule({ providers: [provideAppTheme()] });
    const locale = TestBed.inject(LocalizationRuntime);
    locale.setLanguage('en');
    await locale.loadNamespace('core');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it('releases each replaced/cleared/destroyed URL and masks an obsolete lease immediately', async () => {
    const a = await validatePdfDocument(new Blob(['%PDF-a'], { type: 'application/pdf' }));
    const b = await validatePdfDocument(new Blob(['%PDF-b'], { type: 'application/pdf' }));
    const fixture = TestBed.createComponent(PdfViewer);
    fixture.componentRef.setInput('title', 'Fixture PDF');
    fixture.componentRef.setInput('document', a);
    await fixture.whenStable();
    expect(URL.createObjectURL).toHaveBeenCalledWith(a.bytes);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('a')).toHaveLength(2);
    expect(root.querySelector('a')?.getAttribute('rel')).toBe('noopener noreferrer');
    fixture.componentRef.setInput('document', b);
    expect(fixture.componentInstance.current()).toBeNull();
    await fixture.whenStable();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('document', null);
    expect(fixture.componentInstance.current()).toBeNull();
    await fixture.whenStable();
    expect(root.querySelector('a')).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(2);
    fixture.componentRef.setInput('document', a);
    await fixture.whenStable();
    fixture.destroy();
    expect(URL.createObjectURL).toHaveBeenCalledTimes(3);
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(3);
  });
  it('keeps open and download available when inline preview is unsupported', async () => {
    const document = await validatePdfDocument(
      new Blob(['%PDF-fixture'], { type: 'application/pdf' }),
    );
    const fixture = TestBed.createComponent(PdfViewer);
    fixture.componentRef.setInput('title', 'Fixture PDF');
    fixture.componentRef.setInput('document', document);
    fixture.componentRef.setInput('downloadName', 'countries-fixture.pdf');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.inlineSupported).toBe(false);
    expect(root.querySelector('iframe')).toBeNull();
    expect(root.querySelector('[role=status]')?.textContent).toContain('Open or download');
    expect(root.querySelector('a[download]')?.getAttribute('download')).toBe(
      'countries-fixture.pdf',
    );
  });
  it('retains the original iframe and Blob URL when the application theme changes', async () => {
    vi.stubGlobal('navigator', { pdfViewerEnabled: true, userAgent: navigator.userAgent });
    const document = await validatePdfDocument(
      new Blob(['%PDF-fixture'], { type: 'application/pdf' }),
    );
    const fixture = TestBed.createComponent(PdfViewer);
    fixture.componentRef.setInput('title', 'Fixture PDF');
    fixture.componentRef.setInput('document', document);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const frame = root.querySelector('iframe');
    expect(frame).not.toBeNull();
    const source = frame?.src;
    TestBed.inject(ThemeService).setMode('dark', false);
    await fixture.whenStable();
    expect(root.querySelector('iframe')).toBe(frame);
    expect(frame?.src).toBe(source);
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    fixture.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});
