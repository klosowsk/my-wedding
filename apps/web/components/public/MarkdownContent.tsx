interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Basic server-side markdown renderer.
 * Converts common markdown patterns to HTML.
 * Will be replaced with react-markdown in a later phase.
 */
function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML entities first (basic XSS prevention)
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Headings (## h2, ### h3, etc.) — process from most # to least
  html = html.replace(/^#### (.+)$/gm, '<h4 class="font-body font-bold text-heading text-lg mt-8 mb-3">$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3 class="font-body font-bold text-heading text-xl mt-10 mb-4">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="font-script text-script text-2xl md:text-3xl tracking-wide mt-12 mb-5">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="font-script text-script text-3xl md:text-4xl tracking-wide mt-12 mb-6">$1</h1>');

  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>');

  // Italic: *text*
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links: [text](url)
  html = html.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors duration-200" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Unordered lists: - item
  html = html.replace(
    /^- (.+)$/gm,
    '<li class="font-body text-body pl-1">$1</li>'
  );
  // Wrap consecutive <li> elements in <ul>
  html = html.replace(
    /(<li class="font-body text-body pl-1">.*?<\/li>\n?)+/g,
    (match) =>
      `<ul class="list-disc list-inside space-y-2 my-4 ml-2">${match}</ul>`
  );

  // Ordered lists: 1. item
  html = html.replace(
    /^\d+\. (.+)$/gm,
    '<li class="font-body text-body pl-1">$1</li>'
  );

  // Horizontal rules: ---
  html = html.replace(
    /^---$/gm,
    '<hr class="border-t border-secondary my-8" />'
  );

  // Blockquotes: > text
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<blockquote class="border-l-4 border-primary-light pl-4 py-1 my-4 italic text-muted font-body">$1</blockquote>'
  );

  // Paragraphs: wrap lines that aren't already wrapped in tags
  html = html
    .split("\n\n")
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      // Don't wrap if block already starts with an HTML tag
      if (/^<(h[1-6]|ul|ol|li|blockquote|hr|div)/.test(trimmed)) {
        return trimmed;
      }
      return `<p class="font-body text-body text-base leading-relaxed mb-4">${trimmed}</p>`;
    })
    .join("\n");

  // Inline code: `code`
  html = html.replace(
    /`(.+?)`/g,
    '<code class="bg-surface px-1.5 py-0.5 rounded text-sm font-mono text-heading">$1</code>'
  );

  return html;
}

export default function MarkdownContent({
  content,
  className = "",
}: MarkdownContentProps) {
  const html = renderMarkdown(content);

  return (
    <div
      className={[
        "max-w-[768px] mx-auto font-body text-body leading-relaxed",
        "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
