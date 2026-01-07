'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownContentProps {
  content: string;
}

// Convert citation numbers like [37] into clickable links to specific references
function convertCitationsToLinks(content: string): string {
  // Match [number] pattern but not if it's part of a markdown link ]( or image ![
  // This regex finds [digits] not followed by ( and not preceded by !
  // Link directly to the specific reference anchor (e.g., #ref-37)
  return content.replace(/(?<!!)\[(\d+)\](?!\()/g, '<a href="#ref-$1" class="citation-link">[$1]</a>');
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  // Process citations before rendering
  const processedContent = convertCitationsToLinks(content);

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Custom rendering for code blocks
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return <code className="inline-code">{children}</code>;
            }
            return <pre className="code-block"><code>{children}</code></pre>;
          },
          // Custom rendering for lists
          ul: ({ children }) => <ul className="markdown-list">{children}</ul>,
          ol: ({ children }) => <ol className="markdown-list-ordered">{children}</ol>,
          // Links
          a: ({ href, children, className }: any) => {
            // Citation links are internal, don't open in new tab
            if (className === 'citation-link') {
              return (
                <a href={href} className={className}>
                  {children}
                </a>
              );
            }
            // External links open in new tab
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
                {children}
              </a>
            );
          },
          // Emphasis
          strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
          em: ({ children }) => <em className="markdown-italic">{children}</em>,
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
