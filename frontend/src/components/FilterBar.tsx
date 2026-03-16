import { useState, useEffect } from 'react';
import type { EventType } from '../types';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { Search, FilterX } from 'lucide-react';

export function FilterBar({ type }: { type: EventType }) {
  const isWebhook = type === 'webhook';
  const store = isWebhook ? useWebhookStore() : useApiRequestStore();
  
  const [source, setSource] = useState(store.filters.source || '');
  const [failed, setFailed] = useState(store.filters.failed || false);
  const [limit, setLimit] = useState(store.filters.limit || 50);

  // Debounced filter application
  useEffect(() => {
    const handler = setTimeout(() => {
      store.setFilters({
        source: source || undefined,
        failed: failed ? true : undefined,
        limit
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [source, failed, limit]);

  const handleClear = () => {
    setSource('');
    setFailed(false);
    setLimit(50);
  };

  return (
    <div className="flex items-center justify-between p-3 bg-zinc-950 border-b border-zinc-800/80 shrink-0 shadow-sm z-20">
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder={isWebhook ? "Filter by source..." : "Filter by service..."}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="pl-9 pr-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all w-64 placeholder:text-zinc-600 font-mono shadow-inner"
          />
        </div>
        
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={failed}
            onChange={(e) => setFailed(e.target.checked)}
            className="w-4 h-4 rounded appearance-none border border-zinc-700 bg-zinc-900 checked:bg-rose-500 checked:border-rose-500 relative before:content-['✓'] before:absolute before:text-white before:text-[10px] before:font-bold before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:opacity-0 checked:before:opacity-100 transition-all cursor-pointer shadow-inner"
          />
          <span className="text-xs uppercase tracking-widest text-zinc-500 group-hover:text-zinc-300 transition-colors font-bold font-mono">Failed Only</span>
        </label>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold font-mono">Limit:</span>
          <select 
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold rounded-md px-2 py-1.5 outline-none focus:border-zinc-600 cursor-pointer font-mono shadow-inner"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        
        <div className="w-px h-5 bg-zinc-800/80"></div>

        <button 
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded-md transition-colors"
        >
          <FilterX className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
