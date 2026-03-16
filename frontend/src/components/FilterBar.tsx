import { useState, useEffect } from 'react';
import type { EventType } from '../types';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { Search, FilterX, Plus } from 'lucide-react';

interface FilterBarProps {
  type: EventType;
  onManualDispatch?: () => void;
}

export function FilterBar({ type, onManualDispatch }: FilterBarProps) {
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
    <div className="flex items-center justify-between p-3 bg-white dark:bg-[#0c0c0c] border-b border-slate-200 dark:border-white/5 shrink-0 z-20">
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={isWebhook ? 'Search events...' : 'Filter by service...'}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-md text-sm text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 outline-none transition-all w-56 placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />
        </div>

        {/* Failed filter — segmented style */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-md">
          <button
            onClick={() => setFailed(false)}
            className={`px-3 py-1 text-[11px] font-medium rounded-[4px] transition-all ${
              !failed
                ? 'bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-slate-50 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFailed(true)}
            className={`px-3 py-1 text-[11px] font-medium rounded-[4px] transition-all ${
              failed
                ? 'bg-white dark:bg-[#1a1a1a] text-rose-600 dark:text-rose-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            Errors
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Manual Dispatch Button — only on API Logs tab */}
        {!isWebhook && onManualDispatch && (
          <>
            <button
              onClick={onManualDispatch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-slate-50 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 rounded-md hover:bg-slate-900/90 dark:hover:bg-slate-50/90 transition-colors shadow-sm uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              Manual Dispatch
            </button>
            <div className="w-px h-5 bg-slate-200 dark:bg-white/5" />
          </>
        )}

        {/* Limit */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Limit:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 cursor-pointer"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="w-px h-5 bg-slate-200 dark:bg-white/5" />

        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md transition-colors"
        >
          <FilterX className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
    </div>
  );
}
