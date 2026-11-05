import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Code2 } from 'lucide-react';
import { SOM_QUESTIONS } from '../data/questions';

interface ScriptExportModalProps {
  onClose: () => void;
}

export const ScriptExportModal: React.FC<ScriptExportModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [format, setFormat] = useState<'markdown' | 'text' | 'json'>('markdown');

  const generateContent = () => {
    if (format === 'json') {
      return JSON.stringify(SOM_QUESTIONS, null, 2);
    }

    if (format === 'text') {
      return SOM_QUESTIONS.map(
        (q) => `Question ${q.id}: ${q.question}\nCorrect Answer: ${q.answer}\n`
      ).join('\n');
    }

    // Markdown formatted as in the user's prompt
    return (
      `### **Strength of Materials — 1-Mark Questions Audio Script**\n\n` +
      SOM_QUESTIONS.map(
        (q) =>
          `* **Question ${q.id}:** ${q.question}\n  * **Correct Answer:** ${q.answer}`
      ).join('\n')
    );
  };

  const content = generateContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOM_100_Audio_Script.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Export 100 Questions Audio Script</h3>
            <p className="text-xs text-slate-400">Download or copy the complete 1-mark audio script for offline study.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Bar */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {(['markdown', 'text', 'json'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                  format === fmt
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto">
          <pre className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
            {content}
          </pre>
        </div>

      </div>
    </div>
  );
};
