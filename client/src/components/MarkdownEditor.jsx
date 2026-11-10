import React, { useState, useRef } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  ListOrdered,
  Link,
  Image,
  Eye,
  Edit3,
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

const MarkdownEditor = ({ value, onChange, placeholder = 'Write your story in markdown...' }) => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'preview'
  const textareaRef = useRef(null);

  // Helper to insert markdown syntax at cursor
  const insertSyntax = (before, after = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end) || defaultText;

    const updated =
      value.substring(0, start) + before + selected + after + value.substring(end);

    onChange(updated);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length
      );
    }, 10);
  };

  const calculateReadingTime = () => {
    if (!value) return 1;
    const words = value.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand-500/40">
      {/* Editor Toolbar & Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/80 gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'write'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {activeTab === 'write' && (
          <div className="flex flex-wrap items-center gap-0.5 border-l border-slate-300 dark:border-slate-700 pl-2">
            <button
              type="button"
              onClick={() => insertSyntax('**', '**', 'bold text')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('*', '*', 'italic text')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertSyntax('# ', '', 'Heading 1')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('## ', '', 'Heading 2')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('### ', '', 'Heading 3')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertSyntax('> ', '', 'Quoted thought')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('```javascript\n', '\n```', '// code here')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
            <button
              type="button"
              onClick={() => insertSyntax('- ', '', 'List item')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('1. ', '', 'First item')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('[', '](https://example.com)', 'Link text')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Link"
            >
              <Link className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertSyntax('![Image description](', ')', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643')}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="Image"
            >
              <Image className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {wordCount} words · ~{calculateReadingTime()} min read
        </div>
      </div>

      {/* Editor Content Area */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={14}
          className="w-full p-4 bg-transparent text-slate-900 dark:text-slate-100 font-mono text-sm leading-relaxed resize-y focus:outline-none"
        />
      ) : (
        <div className="p-6 min-h-[320px] bg-slate-50/50 dark:bg-slate-950/40">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm italic text-slate-400">Nothing to preview yet. Switch back to Write tab to compose your article.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
