import { useEffect, useState, useCallback, useRef } from 'react';
import { useDebugPrompt } from '../hooks/useDebugPrompt';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, RefreshCw, Sparkles, Code2, ArrowRight, Check, Copy } from 'lucide-react';
import type { WebhookEvent, ApiRequest } from '../types';

export function DebugPromptModal() {
  const { event, eventType, isOpen, close } = useDebugPrompt();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const responseRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const streamAnalysis = useCallback(async () => {
    if (!event || !eventType) return;

    // Cancel any in-flight request
    abortRef.current?.abort();

    setResponse('');
    setError(null);
    setCopied(false);
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${baseUrl}/api/ai-debug/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, eventId: event.id }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(
          (errData as { message?: string }).message || `HTTP ${res.status}`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6)) as {
                text?: string;
                done?: boolean;
                error?: string;
              };
              if (data.error) {
                setError(data.error);
              } else if (data.text) {
                setResponse((prev) => prev + data.text);
              }
            } catch {
              // skip malformed lines
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message || 'Failed to stream analysis');
      }
    } finally {
      setLoading(false);
    }
  }, [event, eventType]);

  const handleCopy = async () => {
    if (!response) return;
    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Auto-stream on open
  useEffect(() => {
    if (isOpen) {
      streamAnalysis();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [isOpen, streamAnalysis]);

  // Auto-scroll response
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        abortRef.current?.abort();
        close();
      }
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, close]);

  if (!isOpen || !event || !eventType) return null;

  const isWebhook = eventType === 'webhook';
  const method = event.method;
  const url = isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint;
  const status = isWebhook ? (event as WebhookEvent).status : (event as ApiRequest).responseStatus;

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0c0c0c]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-amber-500" />
              <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                AI Debug Analysis
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              disabled={!response}
              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy response"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            <button
              onClick={() => { abortRef.current?.abort(); close(); }}
              className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Context Summary */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
              <Code2 size={12} />
              {method}
            </span>
            <ArrowRight size={14} className="text-slate-400" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 truncate flex-1">
              {url}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${status >= 400
              ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
              : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              }`}>
              {status}
            </span>
          </div>
        </div>

        {/* AI Response */}
        <div
          ref={responseRef}
          className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white dark:bg-[#1a1a1a]"
        >
          {loading && !response && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="relative">
                <div className="w-10 h-10 border-2 border-slate-200 dark:border-white/10 border-t-amber-500 rounded-full animate-spin" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Analyzing request with AI...
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg">
              <p className="text-sm text-rose-700 dark:text-rose-400 font-medium">{error}</p>
            </div>
          )}

          {response && (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:p-0 prose-pre:bg-transparent prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const inline = !match;
                    return inline ? (
                      <code
                        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-[13px] font-mono text-slate-800 dark:text-slate-200"
                        {...props}
                      >
                        {children}
                      </code>
                    ) : (
                      <SyntaxHighlighter
                        style={isDark ? oneDark : oneLight}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.5rem',
                          fontSize: '13px',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  },
                }}
              >
                {response}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0c0c0c] flex justify-between items-center shrink-0">
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            Powered by Gemini 2.5 Flash
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { abortRef.current?.abort(); close(); }}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 dark:hover:bg-white/5 h-9 px-4 py-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-50"
            >
              Dismiss
            </button>
            <button
              onClick={streamAnalysis}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md text-sm font-bold bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 shadow hover:bg-slate-900/90 dark:hover:bg-slate-50/90 h-9 px-5 py-2 transition-all gap-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <RefreshCw className="w-4 h-4" />
              Re-analyze
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
