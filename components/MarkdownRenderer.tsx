import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  return (
    <div className={`prose dark:prose-invert max-w-none prose-sm ${className}`}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
            code({node, inline, className, children, ...props}: any) {
                return !inline ? (
                    <div className="bg-gray-800 text-gray-100 rounded-md p-2 my-2 overflow-x-auto text-xs font-mono">
                        <code {...props}>{children}</code>
                    </div>
                ) : (
                    <code className="bg-gray-200 dark:bg-gray-700 rounded px-1 py-0.5 text-xs font-mono" {...props}>
                        {children}
                    </code>
                )
            },
            a({node, children, ...props}: any) {
                return <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
            },
            ul({node, children, ...props}: any) {
                return <ul className="list-disc ml-4 my-2" {...props}>{children}</ul>
            },
            ol({node, children, ...props}: any) {
                return <ol className="list-decimal ml-4 my-2" {...props}>{children}</ul>
            }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;