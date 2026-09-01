import React, { useState, useRef } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { RotateCcw, Copy, Check, Sparkles, ZoomIn, ZoomOut, FileCode2, CheckCheck, Loader2 } from 'lucide-react';

interface Props {
  code: string;
  onChange: (value: string) => void;
  fileName: string;
  starterCode: string;
  isSaving?: boolean;
}

export const CodeEditor: React.FC<Props> = ({
  code,
  onChange,
  fileName,
  starterCode,
  isSaving = false,
}) => {
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define sleek dark theme
    monaco.editor.defineTheme('forgeDark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'class', foreground: '4EC9B0' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#0f141f',
        'editor.foreground': '#d4d4d4',
        'editor.lineHighlightBackground': '#182030',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#38bdf8',
        'editorGutter.background': '#0c1019',
        'editorCursor.foreground': '#38bdf8',
        'editor.selectionBackground': '#264f78',
      },
    });

    monaco.editor.setTheme('forgeDark');
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    onChange(starterCode);
    setShowResetConfirm(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0f141f] border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c1019] border-b border-slate-800/90 text-xs">
        
        {/* Left: Active File Tab */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#0f141f] border-t-2 border-t-brand-500 border-x border-slate-800 rounded-t text-slate-200 font-mono font-medium text-xs shadow-sm">
            <FileCode2 className="w-3.5 h-3.5 text-brand-400" />
            <span>{fileName}.java</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-500 text-[11px] font-mono ml-2">
            {isSaving ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-slate-400">
                <CheckCheck className="w-3 h-3 text-emerald-400" />
                Auto-saved
              </span>
            )}
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-1.5 text-slate-400">
          
          {/* Zoom controls */}
          <button
            onClick={() => setFontSize(prev => Math.max(12, prev - 1))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Decrease font size"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono w-6 text-center text-slate-500">{fontSize}px</span>
          <button
            onClick={() => setFontSize(prev => Math.min(20, prev + 1))}
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Increase font size"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Format Document */}
          <button
            onClick={handleFormat}
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Format code"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Format</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Reset Code */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1 px-2.5 py-1 hover:bg-slate-800 rounded text-slate-400 hover:text-rose-400 transition-colors"
            title="Reset to starter code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language="java"
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="absolute inset-0 z-30 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-dark-900 border border-slate-700 rounded-lg p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-base font-semibold text-white mb-2">Reset Code?</h3>
            <p className="text-xs text-slate-400 mb-5">
              This will overwrite your current solution with the original starter code. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 rounded text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                Yes, Reset Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
