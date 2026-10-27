import { isolatedPreviewHtml, isSafePreviewNavigation } from './safe-html-preview';
describe('isolated static HTML preview', () => {
  it('blocks network, file, executable and relative navigation while allowing only the initial document', () => {
    expect(isSafePreviewNavigation('about:blank')).toBe(true);
    for (const url of ['https://example.invalid/action', 'http://localhost/', 'file:///data/token', 'javascript:alert(1)', '//example.com', '/reset']) {
      expect(isSafePreviewNavigation(url)).toBe(false);
    }
  });
  it('preserves final server HTML and adds a no-network content security policy', () => {
    const html = '<html dir="rtl"><body><p>Sample</p></body></html>';
    expect(isolatedPreviewHtml(html)).toContain("default-src 'none'");
    expect(isolatedPreviewHtml(html)).toContain(html);
  });
});
