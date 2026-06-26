/**
 * Prints a DOM node in isolation via a hidden iframe.
 * The node should use inline styles so its appearance is preserved
 * inside the blank print document (Tailwind classes are not available there).
 */
export function printElement(node: HTMLElement | null, title = 'Print') {
  if (!node || typeof window === 'undefined') return;
  printHtml(node.outerHTML, title);
}

/**
 * Prints a raw HTML string in isolation via a hidden iframe.
 * Use inline styles inside the markup for predictable output.
 */
export function printHtml(html: string, title = 'Print') {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(
    `<!doctype html><html><head><meta charset="utf-8" /><title>${title}</title>` +
      `<style>@page{margin:8px}html,body{margin:0;padding:0}` +
      `*{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box;}</style>` +
      `</head><body>${html}</body></html>`,
  );
  doc.close();

  const win = iframe.contentWindow;
  const cleanup = () =>
    setTimeout(() => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    }, 800);

  setTimeout(() => {
    try {
      win?.focus();
      win?.print();
    } finally {
      cleanup();
    }
  }, 300);
}
