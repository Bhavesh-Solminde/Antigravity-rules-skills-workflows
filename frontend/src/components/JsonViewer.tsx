import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface JsonViewerProps {
  data: Record<string, unknown> | string | undefined | null;
  label?: string;
  defaultExpanded?: boolean;
}

export function JsonViewer({ data, label, defaultExpanded = true }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  // Guard against null/undefined data
  const safeData = data ?? {};
  const isString = typeof safeData === 'string';
  const displayData = isString ? safeData : JSON.stringify(safeData, null, 2);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(displayData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Theme-aware syntax highlighting using CSS variables
  const highlighted = displayData.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match: string) => {
      let cssVar = 'var(--json-string)'; // string values
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cssVar = 'var(--json-key)'; // keys
        }
      } else if (/true|false/.test(match)) {
        cssVar = 'var(--json-bool)'; // booleans
      } else if (/null/.test(match)) {
        cssVar = 'var(--json-bool)'; // null
      } else {
        cssVar = 'var(--json-number)'; // numbers
      }
      return `<span style="color:${cssVar}">${match}</span>`;
    }
  );

  return (
    <div className="group relative rounded-md border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
      {/* macOS-style title bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-card)] border-b border-slate-200 dark:border-black/20 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label || 'JSON Payload'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
        </button>
      </div>

      {/* JSON content */}
      {expanded && (
        <div className="p-5 overflow-x-auto" style={{ backgroundColor: 'var(--json-bg)' }}>
          <pre
            className="text-[13px] leading-relaxed font-mono"
            style={{ color: 'var(--json-text)' }}
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </div>
      )}
    </div>
  );
}
