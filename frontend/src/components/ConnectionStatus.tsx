import { useSocket } from '../hooks/useSocket';
import { cn } from '../lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const { connected } = useSocket();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="relative flex h-2 w-2">
        {connected ? (
          <>
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </>
        ) : (
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        )}
      </div>
      <span className={cn(
        "text-xs font-semibold tracking-wide font-mono",
        connected ? "text-emerald-400" : "text-rose-400"
      )}>
        {connected ? "LIVE" : "DISCONNECT"}
      </span>
      {connected ? (
        <Wifi className="w-3.5 h-3.5 text-emerald-500/70 ml-1" />
      ) : (
        <WifiOff className="w-3.5 h-3.5 text-rose-500/70 ml-1" />
      )}
    </div>
  );
}
