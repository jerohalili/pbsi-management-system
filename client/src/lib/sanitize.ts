import DOMPurify from 'dompurify';

let hookInstalled = false;

/** Makes every surviving link open safely in a new tab. */
function installLinkHook(): void {
  if (hookInstalled) return;
  hookInstalled = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node instanceof HTMLAnchorElement && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/** Strips scripts, event handlers, javascript: links and inline styles from teacher-authored HTML. */
export function sanitizeHtml(dirty: string): string {
  installLinkHook();
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  });
}

/** True when the text contains HTML tags (older blocks may be plain text with line breaks). */
export function hasHtmlTags(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

/** Plain text of an HTML string, for previews and emptiness checks. */
export function htmlToText(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Turns older plain-text content into paragraphs so line breaks survive the editor. */
export function toEditorHtml(raw: string): string {
  if (!raw || hasHtmlTags(raw)) return raw;
  const escape = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return raw
    .split(/\n{2,}/)
    .map((para) => `<p>${escape(para).replace(/\n/g, '<br>')}</p>`)
    .join('');
}
