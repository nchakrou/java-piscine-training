import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Copy, Check, Terminal, FileCode2 } from 'lucide-react';

interface Props {
  content: string;
}

export const MarkdownView: React.FC<Props> = ({ content }) => {
  return (
    <div className="markdown-body text-slate-200 text-sm leading-relaxed p-6 overflow-y-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-white mt-2 mb-4 pb-2 border-b border-slate-800 flex items-center gap-2" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-slate-100 mt-6 mb-3 pb-1 border-b border-slate-800" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base font-semibold text-brand-400 mt-5 mb-2 flex items-center gap-1.5" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-3 text-slate-300 leading-relaxed" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc list-outside pl-5 mb-4 space-y-1 text-slate-300" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal list-outside pl-5 mb-4 space-y-1 text-slate-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-brand-500 bg-brand-500/10 px-4 py-2 my-4 rounded-r text-slate-300 italic" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 border border-slate-700 rounded-lg">
              <table className="w-full text-left text-sm text-slate-300" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="bg-slate-800 px-4 py-2.5 font-semibold text-slate-200 border-b border-slate-700" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-4 py-2 border-b border-slate-800/80 bg-slate-900/40" {...props} />
          ),
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');

            if (!inline && (lang || codeString.includes('\n') || codeString.includes('public class') || codeString.includes('javac'))) {
              return <CodeBlock language={lang || 'java'} code={codeString} />;
            }

            return (
              <code
                className="bg-slate-800 text-brand-400 px-1.5 py-0.5 rounded font-mono text-[13px] border border-slate-700/60"
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isTerminal = language === 'shell' || language === 'bash' || language === 'sh' || code.startsWith('$');

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-700/80 bg-[#141822] shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          {isTerminal ? <Terminal className="w-3.5 h-3.5 text-amber-400" /> : <FileCode2 className="w-3.5 h-3.5 text-brand-400" />}
          <span className="uppercase text-[11px] font-semibold">{language || 'JAVA'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-[11px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
