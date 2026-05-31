/**
 * HTML sanitizer for kudos message content.
 * Uses sanitize-html to whitelist a safe subset of rich-text tags produced
 * by the Tiptap WYSIWYG editor, then strips everything else.
 */
import sanitizeHtml from "sanitize-html";

/** Allowed inline/block tags — matches the Tiptap extensions in use. */
const ALLOWED_TAGS: sanitizeHtml.IOptions["allowedTags"] = [
  "b", "strong", "i", "em", "s", "strike",
  "ul", "ol", "li",
  "a",
  "blockquote",
  "p", "br",
  "span",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    // Force safe link attributes; only http/https/mailto schemes allowed.
    a: ["href", "rel", "target"],
    // Allow mention chips produced by the Tiptap Mention extension.
    span: ["data-mention", "data-user-id"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  // Force safe external-link attributes — applied after attribute whitelist.
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
  },
  // Strip on* event handlers and style attributes not in the whitelist above.
  disallowedTagsMode: "discard",
};

/**
 * Sanitize raw HTML from the Tiptap editor.
 * Returns a string safe to store and render as innerHTML.
 */
export function sanitizeKudosHtml(dirty: string): string {
  return sanitizeHtml(dirty, SANITIZE_OPTIONS);
}

/**
 * Strip all HTML tags and return the plain-text character count.
 * Used to validate the 1–1000 character message length constraint.
 */
export function kudosHtmlPlainTextLength(html: string): number {
  const stripped = sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
  return stripped.trim().length;
}
