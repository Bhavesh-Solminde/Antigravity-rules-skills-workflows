import { useEffect, useState } from 'react';
import { useDebugPrompt } from '../hooks/useDebugPrompt';
import { Copy, X, Check } from 'lucide-react';

export function DebugPromptModal() {
  const { prompt, clear } = useDebugPrompt();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clear();
    };
    if (prompt) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [prompt, clear]);

  if (!prompt) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-zinc-800/80 rounded-xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.15)] w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            <h2 className="text-sm font-semibold text-zinc-100 font-mono tracking-wide uppercase">AI Debug Context Generated</h2>
          </div>
          <button 
            onClick={clear}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-zinc-950">
          <div className="bg-[#0f0f11] border border-zinc-800/80 rounded-lg p-5 font-mono text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed shadow-inner">
            {prompt}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-zinc-800/60 bg-zinc-900/50 flex justify-end gap-3 shrink-0">
          <button
            onClick={clear}
            className="px-4 py-2 rounded-md text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-zinc-100 text-zinc-900 hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Prompt!' : 'Copy to Clipboard'}
          </button>
        </div>

      </div>
    </div>
  );
}
