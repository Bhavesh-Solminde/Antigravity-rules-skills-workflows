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
          <div key={i} className="h-28 bg-slate-100 dark:bg-white/5 animate-pulse rounded-md border border-slate-200 dark:border-white/5" />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Activity className="w-10 h-10 text-slate-400 dark:text-slate-600 mb-4" />
        <h3 className="text-sm font-medium text-slate-500 mb-1">Waiting for traffic</h3>
        <p className="text-xs text-slate-400 dark:text-slate-600 max-w-[220px]">
          {type === 'webhook'
            ? 'Incoming webhooks will appear here instantly.'
            : 'Dispatched API proxy requests will be logged here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto w-full max-w-full custom-scrollbar">
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
