'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
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
          a: ({ href, children }: any) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="markdown-link">
              {children}
            </a>
          ),
          // Emphasis
          strong: ({ children }) => <strong className="markdown-bold">{children}</strong>,
          em: ({ children }) => <em className="markdown-italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
