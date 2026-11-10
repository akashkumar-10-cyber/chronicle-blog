import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-900 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 text-xs font-mono text-slate-400">
        <span>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
          title="Copy code"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const MarkdownRenderer = ({ content = '' }) => {
  if (!content) return null;

  // Split into lines for parsing blocks
  const lines = content.trim().split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLanguage = '';
  let inList = false;
  let listItems = [];
  let isOrderedList = false;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      if (isOrderedList) {
        elements.push(
          <ol key={`ol-${elements.length}`} className="my-4 list-decimal pl-6 space-y-1.5 text-slate-700 dark:text-slate-300">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`ul-${elements.length}`} className="my-4 list-disc pl-6 space-y-1.5 text-slate-700 dark:text-slate-300">
            {listItems.map((item, idx) => (
              <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  // Helper for inline markdown: bold, italic, inline code, link, image
  const formatInline = (text) => {
    if (!text) return '';
    let formatted = text
      // Images: ![alt](url)
      .replace(
        /!\[(.*?)\]\((.*?)\)/g,
        '<img src="$2" alt="$1" class="my-6 rounded-xl max-w-full h-auto shadow-md mx-auto" />'
      )
      // Links: [text](url)
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-brand-600 dark:text-brand-400 underline underline-offset-4 hover:opacity-80 transition-opacity font-medium">$1</a>'
      )
      // Bold + Italic: ***text***
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      // Italic: *text*
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // Inline code: `code`
      .replace(
        /`([^`]+)`/g,
        '<code class="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-brand-700 dark:text-brand-300 font-mono text-sm">$1</code>'
      );

    return formatted;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fences ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <CodeBlock
            key={`code-${elements.length}`}
            language={codeLanguage}
            code={codeBuffer.join('\n')}
          />
        );
        codeBuffer = [];
        codeLanguage = '';
        inCodeBlock = false;
      } else {
        // Start of code block
        flushList();
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Check for lists
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.*)$/);
    const orderedMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);

    if (unorderedMatch) {
      if (!inList || isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = false;
      }
      listItems.push(unorderedMatch[2]);
      continue;
    } else if (orderedMatch) {
      if (!inList || !isOrderedList) {
        flushList();
        inList = true;
        isOrderedList = true;
      }
      listItems.push(orderedMatch[2]);
      continue;
    } else {
      flushList();
    }

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="text-3xl md:text-4xl font-extrabold font-sans text-slate-900 dark:text-white mt-10 mb-4 tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }}
        />
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-2xl md:text-3xl font-bold font-sans text-slate-900 dark:text-white mt-8 mb-3 tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(3)) }}
        />
      );
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-xl md:text-2xl font-semibold font-sans text-slate-900 dark:text-white mt-6 mb-2 tracking-tight"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(4)) }}
        />
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="border-l-4 border-brand-500 pl-4 py-1 my-5 text-slate-600 dark:text-slate-400 italic font-serif text-lg bg-slate-100/50 dark:bg-slate-800/40 rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }}
        />
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-8 border-slate-200 dark:border-slate-800" />
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p
        key={`p-${elements.length}`}
        className="my-4 text-slate-700 dark:text-slate-300 font-serif leading-relaxed text-base md:text-lg"
        dangerouslySetInnerHTML={{ __html: formatInline(line) }}
      />
    );
  }

  flushList();

  return <div className="article-prose">{elements}</div>;
};

export default MarkdownRenderer;
