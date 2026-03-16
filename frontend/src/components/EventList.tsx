import type { WebhookEvent, ApiRequest, EventType } from '../types';
import { EventCard } from './EventCard';
import { Activity } from 'lucide-react';

interface EventListProps {
  type: EventType;
  events: (WebhookEvent | ApiRequest)[];
  selectedId: string | undefined;
  onSelect: (event: WebhookEvent | ApiRequest) => void;
  loading: boolean;
}

export function EventList({ type, events, selectedId, onSelect, loading }: EventListProps) {
  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-28 bg-zinc-900/50 animate-pulse rounded-lg border border-zinc-800/50" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-zinc-950/20">
        <div className="relative mb-6">
          <Activity className="w-8 h-8 text-zinc-700 mx-auto" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-2 border-zinc-800 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
        <h3 className="text-zinc-400 font-medium mb-2 font-mono text-sm tracking-wide lowercase">Waiting for traffic</h3>
        <p className="text-zinc-600 text-xs max-w-[200px]">
          {type === 'webhook' 
            ? "Incoming webhooks will appear here instantly." 
            : "Dispatched API proxy requests will be logged here."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {events.map((event) => (
        <EventCard
          key={event._id}
          event={event}
          type={type}
          isSelected={selectedId === event._id}
          onClick={() => onSelect(event)}
        />
      ))}
    </div>
  );
}
