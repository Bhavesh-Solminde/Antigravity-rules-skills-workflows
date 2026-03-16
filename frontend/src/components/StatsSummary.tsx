import type { EventType } from '../types';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { formatDistanceToNow } from 'date-fns';
import { Activity, XCircle, Clock, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

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

  return (
    <div className="grid grid-cols-4 gap-5 p-5 bg-[#09090b] border-b border-zinc-800/80 shrink-0 shadow-sm z-10">
      
      <StatCard 
        icon={<Activity className="w-5 h-5 text-emerald-400" />}
        title="Total Captured"
        value={total}
        trend={total > 0 ? "Active" : "Waiting"}
      />
      
      <StatCard 
        icon={<XCircle className={cn("w-5 h-5", failed > 0 ? "text-rose-400" : "text-zinc-600")} />}
        title="Failed Events"
        value={failed}
        valueColor={failed > 0 ? "text-rose-400 border-b border-rose-500/30" : "text-zinc-100"}
      />
      
      <StatCard 
        icon={<Zap className="w-5 h-5 text-amber-400" />}
        title="Avg Latency"
        value={`${avgResponseTime}ms`}
      />
      
      <StatCard 
        icon={<Clock className="w-5 h-5 text-blue-400" />}
        title="Last Event"
        value={lastEventTime}
        isText
      />

    </div>
  );
}

function StatCard({ 
  icon, 
  title, 
  value, 
  valueColor = "text-zinc-100",
  trend,
  isText = false
}: { 
  icon: React.ReactNode, 
  title: string, 
  value: string | number, 
  valueColor?: string,
  trend?: string,
  isText?: boolean
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800/80 p-5 rounded-xl flex flex-col gap-3 relative overflow-hidden group shadow-[inset_0_1px_4px_rgba(255,255,255,0.02)] hover:border-zinc-700 hover:bg-zinc-900/40 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 font-bold">{title}</span>
        {icon}
      </div>
      <div className="flex items-end gap-3 mt-1 relative z-10">
        <span className={cn(
          "font-bold tracking-tight pb-0.5",
          isText ? "text-xl font-mono" : "text-4xl tabular-nums",
          valueColor
        )}>
          {value}
        </span>
        {trend && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md shadow-sm">
            {trend}
          </span>
        )}
      </div>
      
      {/* Decorative gradient corner */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tl from-zinc-800/30 via-zinc-800/5 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </div>
  );
}
