import { useSocket } from '../hooks/useSocket';
import { Activity } from 'lucide-react';

export function ConnectionStatus() {
  const { connected } = useSocket();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
        {connected ? 'Cluster Online' : 'Offline'}
      </span>
      {connected && <Activity size={14} className="text-emerald-500 animate-pulse" />}
    </div>
  );
}
