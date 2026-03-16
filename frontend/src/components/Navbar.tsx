import { useUiStore } from '../store/uiStore';
import { ConnectionStatus } from './ConnectionStatus';
import { TerminalSquare } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);

  return (
    <nav className="h-14 bg-[#09090b] border-b border-zinc-800/80 flex items-center justify-between px-6 shrink-0 relative z-30 shadow-md">
      <div className="flex items-center gap-10 h-full">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20">
            <TerminalSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-tight text-emerald-50 font-mono">
            DevProxy<span className="text-emerald-500 inline-block animate-[pulse_1.5s_ease-in-out_infinite] opacity-60">_</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 h-full pt-1">
          <button
            onClick={() => setActiveTab('webhook')}
            className={cn(
              "relative px-4 h-full flex items-center gap-2 text-sm font-semibold transition-colors font-mono tracking-wide",
              activeTab === 'webhook' 
                ? "text-emerald-400" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            Webhooks
            {activeTab === 'webhook' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] rounded-t-md" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('api_request')}
            className={cn(
              "relative px-4 h-full flex items-center gap-2 text-sm font-semibold transition-colors font-mono tracking-wide",
              activeTab === 'api_request' 
                ? "text-emerald-400" 
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            API Requests
            {activeTab === 'api_request' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)] rounded-t-md" />
            )}
          </button>
        </div>
      </div>

      <ConnectionStatus />
    </nav>
  );
}
