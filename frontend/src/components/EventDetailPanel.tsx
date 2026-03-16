import type { WebhookEvent, ApiRequest, EventType } from '../types';
import { JsonViewer } from './JsonViewer';
import { SourceIcon } from './SourceIcon';
import { StatusBadge } from './StatusBadge';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { useDebugPrompt } from '../hooks/useDebugPrompt';
import { RefreshCw, Sparkles, Trash2, Webhook, Code2, Clock, Zap, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

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

  const { open: openDebugModal } = useDebugPrompt();

  if (!event) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 gap-4 opacity-50">
        <Webhook size={48} strokeWidth={1} />
        <p className="text-sm font-medium">Select an event to inspect details</p>
      </div>
    );
  }

  const handleReplay = () => {
    if (isWebhook) replayWebhook(event.id);
    else replayApiRequest(event.id);
  };

  const handleDelete = () => {
    if (isWebhook) deleteWebhook(event.id);
    else deleteApiRequest(event.id);
  };

  const handleOpenDebug = () => {
    openDebugModal(type, event);
  };

  const sourceLabel = isWebhook ? (event as WebhookEvent).source : (event as ApiRequest).service;
  const status = isWebhook ? (event as WebhookEvent).status : (event as ApiRequest).responseStatus;
  const url = isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-5 border-b border-slate-100 dark:border-white/5 shrink-0">
        <div className="flex items-center gap-3">
          <SourceIcon source={sourceLabel || 'unknown'} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold capitalize text-slate-900 dark:text-slate-50">
                {sourceLabel || 'unknown'} Event
              </h2>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs font-mono text-slate-500 mt-1">{event.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReplay}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 dark:border-slate-800 bg-transparent shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 h-9 px-4 py-2 text-slate-900 dark:text-slate-50"
          >
            <RefreshCw size={14} className="mr-2" /> Replay
          </button>
          {status >= 400 && (
            <button
              onClick={handleOpenDebug}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-slate-200 dark:border-slate-800 bg-transparent shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800 h-9 px-4 py-2 text-slate-900 dark:text-slate-50"
            >
              <Sparkles size={14} className="mr-2" /> AI Debug
            </button>
          )}
          <button
            onClick={handleDelete}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-rose-200 dark:border-rose-900/30 bg-transparent shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/30 h-9 w-9 px-0 text-rose-500"
            title="Delete Event"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Metadata grid */}
        <div className="p-6 border-b border-slate-100 dark:border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Method', value: event.method, Icon: Code2 },
              { label: 'Time', value: format(new Date(event.timestamp), 'HH:mm:ss'), Icon: Clock },
              { label: 'Latency', value: `${event.responseTime}ms`, Icon: Zap },
              { label: 'Status', value: status, Icon: ShieldAlert },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 dark:bg-white/5 p-3 rounded-lg border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  <item.Icon size={12} />
                  <span className="text-[10px] font-bold uppercase">{item.label}</span>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.value}</p>
              </div>
            ))}
          </div>

          {/* URL */}
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">URL / Endpoint</p>
            <div className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-white/10 px-3 py-2 rounded-md break-all select-all">
              {url}
            </div>
          </div>
        </div>

        {/* JSON Sections */}
        <div className="p-6 space-y-6">
          <JsonViewer
            data={isWebhook ? (event as WebhookEvent).headers : (event as ApiRequest).requestHeaders}
            label="Request Headers"
          />

          <JsonViewer
            data={isWebhook ? (event as WebhookEvent).payload : (event as ApiRequest).requestPayload}
            label="Payload Body"
          />

          {!isWebhook && (
            <JsonViewer
              data={(event as ApiRequest).responseBody}
              label="Response Body"
            />
          )}
        </div>
      </div>
    </div>
  );
}
