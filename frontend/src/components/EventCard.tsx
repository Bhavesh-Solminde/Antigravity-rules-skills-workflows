import type { WebhookEvent, ApiRequest, EventType } from '../types';
import { MethodBadge } from './MethodBadge';
import { StatusBadge } from './StatusBadge';
import { TimestampDisplay } from './TimestampDisplay';
import { cn } from '../lib/utils';
import { Globe, ServerCog } from 'lucide-react';

interface EventCardProps {
  event: WebhookEvent | ApiRequest;
  type: EventType;
  isSelected: boolean;
  onClick: () => void;
}

export function EventCard({ event, type, isSelected, onClick }: EventCardProps) {
  const isWebhook = type === 'webhook';
  const sourceLabel = isWebhook ? (event as WebhookEvent).source : (event as ApiRequest).service;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "group cursor-pointer p-4 border-b border-zinc-800/60 transition-all duration-200 ease-in-out hover:bg-zinc-900/50 relative overflow-hidden",
        isSelected && "bg-zinc-900 border-l-2 border-l-emerald-500",
        !isSelected && "border-l-2 border-l-transparent",
        event.failed && "bg-rose-950/10 hover:bg-rose-950/20"
      )}
    >
      {event.failed && (
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <MethodBadge method={event.method} />
          {isWebhook ? (
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
          ) : (
            <ServerCog className="w-3.5 h-3.5 text-zinc-500" />
          )}
          <span className="font-mono text-[11px] font-semibold text-zinc-400 truncate max-w-[120px]" title={sourceLabel}>
            {sourceLabel || 'unknown'}
          </span>
        </div>
        <StatusBadge status={isWebhook ? (event as WebhookEvent).status : (event as ApiRequest).responseStatus} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="font-mono text-[12px] text-zinc-300 truncate pr-4" title={isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint}>
          {isWebhook ? (event as WebhookEvent).url : (event as ApiRequest).endpoint}
        </div>
        
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-800/30">
          <TimestampDisplay timestamp={event.timestamp} />
          <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
            {event.responseTime}ms
          </span>
        </div>
      </div>
    </div>
  );
}
