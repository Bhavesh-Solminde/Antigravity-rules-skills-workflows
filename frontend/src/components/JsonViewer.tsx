import { useState } from 'react';
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react';


interface JsonViewerProps {
  data: Record<string, unknown> | string;
  label?: string;
  defaultExpanded?: boolean;
}

export function JsonViewer({ data, label, defaultExpanded = true }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const isString = typeof data === 'string';
  const displayData = isString ? data : JSON.stringify(data, null, 2);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(displayData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#09090b] rounded-md border border-zinc-800/80 overflow-hidden font-mono text-xs shadow-inner">
      <div 
        className="flex items-center justify-between px-3 py-2 bg-zinc-900/50 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 text-zinc-400">
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          <span className="font-semibold text-zinc-300 uppercase tracking-widest text-[10px]">{label || 'JSON Payload'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      
      {expanded && (
        <div className="p-3 overflow-x-auto">
          <pre className="text-zinc-300 leading-relaxed tabular-nums">
            <code>{displayData}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
