const pdfBrand: unique symbol = Symbol('Validated PDF');
export interface PdfDocument {
  readonly bytes: Blob;
  readonly [pdfBrand]: true;
}
// Reporting backend accepts configured rendered output up to this ceiling.
export const pdfMaximumBytes = 100 * 1024 * 1024;
export class InvalidPdfError extends Error {
  constructor() {
    super('Invalid PDF document');
  }
}
export function readBlobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Unreadable blob'));
    reader.onerror = () => reject(new Error('Unreadable blob'));
    reader.readAsText(blob);
  });
}
/** Only validated bytes may become a viewer resource. No URL or HTML input. */
export async function validatePdfDocument(input: unknown): Promise<PdfDocument> {
  if (
    !(input instanceof Blob) ||
    input.size < 5 ||
    input.size > pdfMaximumBytes ||
    input.type.split(';')[0].trim().toLowerCase() !== 'application/pdf'
  )
    throw new InvalidPdfError();
  const head = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      reader.result instanceof ArrayBuffer ? resolve(reader.result) : reject(new InvalidPdfError());
    reader.onerror = () => reject(new InvalidPdfError());
    reader.readAsArrayBuffer(input.slice(0, 5));
  });
  if (String.fromCharCode(...new Uint8Array(head)) !== '%PDF-') throw new InvalidPdfError();
  return Object.freeze({ bytes: input, [pdfBrand]: true as const });
}
