import { useState } from 'react';
import { useApiRequestStore } from '../store/apiRequestStore';
import { Send, AlertCircle, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function ProxyRequestForm() {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('');
  const [headersMap, setHeadersMap] = useState<Array<{k: string, v: string}>>([{ k: '', v: '' }]);
  const [payloadStr, setPayloadStr] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const { sendProxyRequest, loading } = useApiRequestStore();

  const handleValidateJson = (val: string) => {
    setPayloadStr(val);
    if (!val.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: unknown) {
      setJsonError((e as Error).message);
    }
  };

  const handleAddHeader = () => {
    setHeadersMap([...headersMap, { k: '', v: '' }]);
  };

  const handleHeaderChange = (index: number, field: 'k' | 'v', value: string) => {
    const newHeaders = [...headersMap];
    newHeaders[index][field] = value;
    setHeadersMap(newHeaders);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpoint) return;

    let payloadObj = undefined;
    if (payloadStr.trim()) {
      try {
        payloadObj = JSON.parse(payloadStr);
      } catch {
        return;
      }
    }

    const headersDict: Record<string, string> = {};
    headersMap.forEach(({k, v}) => {
      if (k.trim()) headersDict[k.trim()] = v.trim();
    });

    await sendProxyRequest({
      method,
      endpoint,
      headers: Object.keys(headersDict).length > 0 ? headersDict : undefined,
      payload: payloadObj
    });
  };

  return (
    <div className="bg-white dark:bg-[#0f0f0f] border-b border-slate-200 dark:border-white/5 p-5 shrink-0 z-10 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-5xl mx-auto">

        {/* URL Row */}
        <div className="flex items-center gap-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-emerald-600 dark:text-emerald-500 font-bold text-sm rounded-md px-4 py-2.5 font-mono outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all appearance-none cursor-pointer"
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <input
            type="url"
            placeholder="https://api.example.com/v1/resource"
            required
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 text-sm rounded-md px-4 py-2.5 font-mono outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
          />

          <button
            type="submit"
            disabled={loading || !!jsonError}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 shadow hover:bg-slate-900/90 dark:hover:bg-slate-50/90 h-10 px-6 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Sending...' : 'Dispatch'}
          </button>
        </div>

        {/* Headers & Payload grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Headers */}
          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Headers</label>
              <button
                type="button"
                onClick={handleAddHeader}
                className="text-xs flex items-center gap-1 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 px-2 py-1 rounded text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors font-mono"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
              {headersMap.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Auth)"
                    value={h.k}
                    onChange={(e) => handleHeaderChange(i, 'k', e.target.value)}
                    className="w-1/2 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs rounded px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.v}
                    onChange={(e) => handleHeaderChange(i, 'v', e.target.value)}
                    className="w-1/2 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs rounded px-3 py-2 font-mono outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payload */}
          <div className="flex flex-col bg-slate-50 dark:bg-white/5 p-4 rounded-lg border border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">JSON Body Payload</label>
              {jsonError && (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3" /> Syntax Error
                </span>
              )}
            </div>
            <textarea
              value={payloadStr}
              onChange={(e) => handleValidateJson(e.target.value)}
              placeholder='{"key": "value"}'
              className={cn(
                'flex-1 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 text-sm rounded-md p-3 font-mono outline-none min-h-[120px] resize-y transition-colors',
                jsonError && 'border-rose-500/50 focus:border-rose-500',
                !jsonError && 'focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600'
              )}
            />
          </div>
        </div>

      </form>
    </div>
  );
}
