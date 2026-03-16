import type { WebhookEvent, ApiRequest, EventType } from '../types';
import { SourceIcon } from './SourceIcon';
import { StatusBadge } from './StatusBadge';
import { TimestampDisplay } from './TimestampDisplay';
import { cn } from '../lib/utils';
import { Clock } from 'lucide-react';

interface EventCardProps {
  event: WebhookEvent | ApiRequest;
  type: EventType;
  isSelected: boolean;
  onClick: () => void;
}

export function EventCard({ event, type, isSelected, onClick }: EventCardProps) {
  const isWebhook = type === 'webhook';
  const sourceLabel = isWebhook ? (event as WebhookEvent).source : (event as ApiRequest).service;
  const url = isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint;
  const status = isWebhook ? (event as WebhookEvent).status : (event as ApiRequest).responseStatus;
  const apiSource = !isWebhook ? (event as ApiRequest).source : undefined;

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-4 text-left border-b border-slate-200 dark:border-white/5 transition-all flex gap-3 items-start',
        isSelected
          ? 'bg-white dark:bg-[#1a1a1a]'
          : 'hover:bg-white/50 dark:hover:bg-white/5',
        event.failed && !isSelected && 'bg-rose-50/50 dark:bg-rose-950/10'
      )}
    >
      <SourceIcon source={sourceLabel || 'unknown'} />

      <div className="space-y-1.5 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium capitalize text-slate-900 dark:text-slate-100">
              {sourceLabel || 'unknown'}
            </span>
            {apiSource && (
              <span
                className={cn(
                  'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded',
                  apiSource === 'auto'
                    ? 'bg-slate-200 text-slate-500 dark:bg-white/10 dark:text-slate-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
                )}
              >
                {apiSource}
              </span>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <p className="text-[11px] font-mono text-slate-500 truncate">{url}</p>

        <div className="flex items-center justify-between text-[10px] font-medium text-slate-400">
          <span className="flex items-center gap-1">
            <Clock size={12} /> {event.responseTime}ms
          </span>
          <TimestampDisplay timestamp={event.timestamp} />
        </div>
      </div>
    </button>
  );
}
