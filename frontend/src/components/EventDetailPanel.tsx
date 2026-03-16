import type { WebhookEvent, ApiRequest, EventType } from '../types';
import { JsonViewer } from './JsonViewer';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { useDebugPrompt } from '../hooks/useDebugPrompt';
import { StatusBadge } from './StatusBadge';
import { MethodBadge } from './MethodBadge';
import { TimestampDisplay } from './TimestampDisplay';
import { Play, Sparkles, Trash2, ArrowRight } from 'lucide-react';

interface EventDetailPanelProps {
  event: WebhookEvent | ApiRequest | null;
  type: EventType;
}

export function EventDetailPanel({ event, type }: EventDetailPanelProps) {
  const isWebhook = type === 'webhook';
  
  const replayWebhook = useWebhookStore((state) => state.replayWebhook);
  const deleteWebhook = useWebhookStore((state) => state.deleteWebhook);
  const replayApiRequest = useApiRequestStore((state) => state.replayApiRequest);
  const deleteApiRequest = useApiRequestStore((state) => state.deleteApiRequest);
  
  const { generate, loading: promptLoading } = useDebugPrompt();

  if (!event) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500 bg-zinc-950/20">
        <ArrowRight className="w-12 h-12 text-zinc-800 mb-4 opacity-50" />
        <p className="font-mono text-xs uppercase tracking-widest text-zinc-600">Select an event to view details</p>
      </div>
    );
  }

  const handleReplay = () => {
    if (isWebhook) replayWebhook(event._id);
    else replayApiRequest(event._id);
  };

  const handleDelete = () => {
    if (isWebhook) deleteWebhook(event._id);
    else deleteApiRequest(event._id);
  };

  const handleGeneratePrompt = () => {
    generate(type, event._id);
  };

  const renderHeaders = (headers: Record<string, string>) => {
    if (!headers || Object.keys(headers).length === 0) return <div className="text-zinc-600 text-xs italic p-4 bg-zinc-950/50 rounded-md">No headers identified</div>;
    return (
      <div className="bg-[#09090b] rounded-md border border-zinc-800/80 p-3 overflow-x-auto shadow-inner">
        <table className="w-full text-left text-xs font-mono">
          <tbody>
            {Object.entries(headers).map(([key, value]) => (
              <tr key={key} className="border-b border-zinc-800/40 last:border-0 hover:bg-zinc-900/30">
                <td className="py-2 pr-6 text-zinc-400 font-semibold whitespace-nowrap align-top">{key}</td>
                <td className="py-2 text-zinc-300 break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#09090b] h-full overflow-hidden border-l border-zinc-800/50 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)] z-10">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <MethodBadge method={event.method} />
          <StatusBadge status={isWebhook ? (event as WebhookEvent).status : (event as ApiRequest).responseStatus} />
          <span className="text-zinc-500 text-xs font-mono tracking-wide">
            {event.responseTime}ms
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={handleReplay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 text-zinc-300 text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" /> Replay
          </button>
          <button 
            onClick={handleGeneratePrompt}
            disabled={promptLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 hover:bg-purple-500/10 hover:text-purple-400 text-zinc-300 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" /> {promptLoading ? 'Generating...' : 'AI Debug'}
          </button>
          <div className="w-px h-5 bg-zinc-800/80 mx-1"></div>
          <button 
            onClick={handleDelete}
            className="p-1.5 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Overview Meta */}
      <div className="p-5 border-b border-zinc-800/40 bg-zinc-900/20 shrink-0">
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">URL / Endpoint</div>
          <div className="font-mono text-sm text-zinc-200 break-all select-all bg-zinc-950 border border-zinc-800/60 p-2 rounded-md shadow-inner">
            {isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">Source / Service</div>
            <div className="font-mono text-xs text-zinc-300 bg-zinc-900/50 px-2 py-1 rounded inline-block">
              {isWebhook ? (event as WebhookEvent).source : (event as ApiRequest).service}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">Timestamp</div>
            <TimestampDisplay timestamp={event.timestamp} className="text-zinc-300 bg-zinc-900/50 px-2 py-1 rounded inline-block" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-mono mb-1.5">Event ID</div>
            <div className="font-mono text-[10px] text-zinc-500 select-all font-semibold">{event.id}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Sections */}
      <div className="flex-1 overflow-y-auto p-5 space-y-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        
        <section>
          <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
            Request Headers
          </h3>
          {renderHeaders(isWebhook ? (event as WebhookEvent).headers : (event as ApiRequest).requestHeaders)}
        </section>

        <section>
          <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-800"></span>
            Request Payload
          </h3>
          <JsonViewer 
            data={isWebhook ? (event as WebhookEvent).payload : (event as ApiRequest).requestPayload} 
            label="Payload Body"
          />
        </section>

        {!isWebhook && (
          <section>
             <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-500 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-900"></span>
              Response Body
            </h3>
            <JsonViewer 
              data={(event as ApiRequest).responseBody} 
              label="Response Payload"
            />
          </section>
        )}

      </div>
    </div>
  );
}
