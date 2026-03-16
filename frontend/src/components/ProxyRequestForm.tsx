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
      } catch (e) {
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
    <div className="bg-[#09090b] border-b border-zinc-800/80 p-5 shrink-0 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)] relative z-10 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl mx-auto">
        
        <div className="flex items-center gap-3">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="bg-zinc-950 border border-zinc-800/80 text-emerald-400 font-bold text-sm rounded-md px-4 py-2.5 font-mono outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
          >
            {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => (
              <option key={m} value={m} className="text-zinc-100">{m}</option>
            ))}
          </select>
          
          <input
            type="url"
            placeholder="https://api.example.com/v1/resource"
            required
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            className="flex-1 bg-zinc-950 border border-zinc-800/80 text-zinc-100 text-sm rounded-md px-4 py-2.5 font-mono outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all placeholder:text-zinc-700 shadow-inner"
          />

          <button
            type="submit"
            disabled={loading || !!jsonError}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm transition-all shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] hover:shadow-[0_0_20px_-3px_rgba(16,185,129,0.6)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Send className="w-4 h-4" />
            Dispatch
          </button>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Headers */}
          <div className="bg-zinc-900/20 p-4 rounded-lg border border-zinc-800/40">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono font-semibold">Headers</label>
              <button 
                type="button" 
                onClick={handleAddHeader}
                className="text-xs flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors font-mono"
              >
                <Plus className="w-3 h-3" /> Add Header
              </button>
            </div>
            <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {headersMap.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Key (e.g. Auth)"
                    value={h.k}
                    onChange={(e) => handleHeaderChange(i, 'k', e.target.value)}
                    className="w-1/2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-xs rounded px-3 py-2 font-mono outline-none focus:border-zinc-600 transition-colors"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={h.v}
                    onChange={(e) => handleHeaderChange(i, 'v', e.target.value)}
                    className="w-1/2 bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-xs rounded px-3 py-2 font-mono outline-none focus:border-zinc-600 transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payload */}
          <div className="flex flex-col bg-zinc-900/20 p-4 rounded-lg border border-zinc-800/40">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-mono font-semibold">JSON Body Payload</label>
              {jsonError && (
                <span className="flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                  <AlertCircle className="w-3 h-3" /> Syntax Error
                </span>
              )}
            </div>
            <textarea
              value={payloadStr}
              onChange={(e) => handleValidateJson(e.target.value)}
              placeholder='{"key": "value"}'
              className={cn(
                "flex-1 bg-zinc-950/80 border border-zinc-800 text-zinc-300 text-sm rounded-md p-3 font-mono outline-none min-h-[120px] resize-y transition-colors",
                jsonError && "border-rose-500/50 focus:border-rose-500",
                !jsonError && "focus:border-zinc-600 focus:bg-zinc-950"
              )}
            />
          </div>
        </div>

      </form>
    </div>
  );
}
