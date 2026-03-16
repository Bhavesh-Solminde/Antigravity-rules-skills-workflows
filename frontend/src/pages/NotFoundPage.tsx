import { Link } from 'react-router-dom';
import { Terminal, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50">
      <div className="flex flex-col items-center text-center max-w-md p-10 bg-white dark:bg-[#0f0f0f] border border-slate-200 dark:border-white/5 rounded-xl shadow-sm">
        <div className="w-16 h-16 bg-slate-900 dark:bg-slate-50 rounded-xl flex items-center justify-center mb-8">
          <Terminal size={32} className="text-slate-50 dark:text-slate-900" />
        </div>
        <h1 className="text-7xl font-black tracking-tight mb-4">404</h1>
        <div className="h-px w-20 bg-slate-200 dark:bg-white/10 my-4" />
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          The requested endpoint does not exist on this proxy server. Please check your routing coordinates.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 font-bold text-sm hover:bg-slate-900/90 dark:hover:bg-slate-50/90 shadow transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
