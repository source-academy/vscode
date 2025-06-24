// Lightweight Markdown → HTML helper for the VS Code Webview.
// Uses `showdown` (≈12 kB gzipped, no React peer-deps) for robust CommonMark
// conversion
// Keeps dependency surface minimal (one package)

import { Converter } from "showdown";

// A singleton converter instance (Showdown initialisation is expensive)
const converter = new Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
  openLinksInNewWindow: true,
});

// Very small sanitiser: strips <script> tags and dangerous inline event attrs.
const sanitize = (html: string): string => {
  // Remove script/style tags completely
  let safe = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Remove on*="..." inline event handlers
  safe = safe.replace(/ on\w+="[^"]*"/g, "");
  return safe;
};

export function markdownToHtml(markdown: string): string {
  const rawHtml = converter.makeHtml(markdown);
  return sanitize(rawHtml);
}

export default markdownToHtml;
