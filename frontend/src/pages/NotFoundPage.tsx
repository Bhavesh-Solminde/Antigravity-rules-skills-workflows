import { Link } from 'react-router-dom';
import { TerminalSquare, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#09090b] text-zinc-100 font-mono">
      <div className="flex flex-col items-center text-center max-w-md p-10 bg-zinc-950 border border-zinc-800/80 rounded-2xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)] relative overflow-hidden">
        
        {/* Decorative Grid BG */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>
        
        <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20 mb-8 relative z-10 shadow-inner">
          <TerminalSquare className="w-12 h-12 text-emerald-400" />
        </div>
        
        <h1 className="text-7xl font-black text-white tracking-tight mb-4 relative z-10 drop-shadow-md">404</h1>
        
        <div className="h-px w-20 bg-emerald-500/50 my-6 relative z-10"></div>
        
        <p className="text-zinc-400 text-sm mb-10 leading-relaxed relative z-10 px-4">
          The requested endpoint or page does not exist on this proxy server. Please check your routing coordinates.
        </p>
        
        <Link 
          to="/"
          className="flex items-center gap-2 px-8 py-3.5 rounded-lg bg-zinc-100 text-zinc-950 hover:bg-white font-bold text-sm transition-all hover:scale-[1.03] active:scale-[0.97] shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] relative z-10 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
