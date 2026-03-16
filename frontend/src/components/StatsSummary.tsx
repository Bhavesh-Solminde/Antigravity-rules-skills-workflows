import type { EventType } from '../types';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { formatDistanceToNow } from 'date-fns';
import { Zap, ShieldAlert, Clock, Activity } from 'lucide-react';
import type { ReactNode } from 'react';

export function StatsSummary({ type }: { type: EventType }) {
  const isWebhook = type === 'webhook';
  const events = isWebhook
    ? useWebhookStore(state => state.webhooks)
    : useApiRequestStore(state => state.apiRequests);

  const total = events.length;
  const failed = events.filter(e => e.failed).length;

  const avgResponseTime = total > 0
    ? Math.round(events.reduce((acc, curr) => acc + curr.responseTime, 0) / total)
    : 0;

  const lastEventTime = total > 0
    ? formatDistanceToNow(new Date(events[0].timestamp), { addSuffix: true })
    : 'Never';

  const stats: Array<{ label: string; value: string | number; Icon: typeof Zap; color: string; bg: string }> = [
    { label: 'Total Inbound', value: total, Icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Error Rate', value: failed, Icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Avg Latency', value: `${avgResponseTime}ms`, Icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Last Event', value: lastEventTime, Icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="grid grid-cols-4 gap-5 p-5 bg-white dark:bg-[#0f0f0f] border-b border-slate-200 dark:border-white/5 shrink-0 z-10">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-md flex items-center justify-center`}>
              <stat.Icon size={20} />
            </div>
          }
        />
      ))}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="group bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 p-5 rounded-xl shadow-sm hover:shadow-md transition-all">
      <div className="mb-4">{icon}</div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">{value}</p>
    </div>
  );
}
