import { InvalidPdfError, pdfMaximumBytes, validatePdfDocument } from './pdf-document';

describe('PDF byte boundary', () => {
  it('accepts a PDF MIME and signature, preserving the original immutable blob', async () => {
    const bytes = new Blob(['%PDF-1.7\nfixture'], { type: 'application/pdf; charset=binary' });
    const document = await validatePdfDocument(bytes);
    expect(document.bytes).toBe(bytes);
    expect(Object.isFrozen(document)).toBe(true);
  });
  for (const [label, value] of [
    ['URL', 'https://example.test/report.pdf'],
    ['empty file', new Blob([], { type: 'application/pdf' })],
    ['HTML MIME', new Blob(['%PDF-1.7'], { type: 'text/html' })],
    ['JSON body', new Blob(['{"error":true}'], { type: 'application/pdf' })],
    ['missing MIME', new Blob(['%PDF-1.7'])],
  ] as const)
    it(`rejects ${label} before creating a viewer resource`, async () => {
      await expect(validatePdfDocument(value)).rejects.toBeInstanceOf(InvalidPdfError);
    });
  it('rejects oversized output before reading its bytes', async () => {
    const bytes = new Blob(['%PDF-1.7'], { type: 'application/pdf' });
    Object.defineProperty(bytes, 'size', { value: pdfMaximumBytes + 1 });
    await expect(validatePdfDocument(bytes)).rejects.toBeInstanceOf(InvalidPdfError);
  });
});
