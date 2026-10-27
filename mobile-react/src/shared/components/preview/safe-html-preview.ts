export function isSafePreviewNavigation(url: string) { return url === 'about:blank'; }
export function isolatedPreviewHtml(html: string) {
  return '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' + html;
}
