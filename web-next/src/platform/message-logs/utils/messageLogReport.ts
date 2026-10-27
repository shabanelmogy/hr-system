/** Input is the server's sanitized, non-navigable history snapshot. No live template is rendered. */
export function messageSnapshotText(html: string | null): string {
  if (!html || typeof DOMParser === "undefined") return "";
  const document = new DOMParser().parseFromString(html, "text/html");
  for (const block of document.body.querySelectorAll("p,h1,h2,h3,li,blockquote")) block.appendChild(document.createTextNode("\n"));
  return document.body.textContent?.trim() ?? "";
}
