import { useUiStore } from '../store/uiStore';
import { ConnectionStatus } from './ConnectionStatus';
import { useTheme } from '../hooks/ThemeContext';
import { Terminal, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export function Navbar() {
  const activeTab = useUiStore((state) => state.activeTab);
  const setActiveTab = useUiStore((state) => state.setActiveTab);
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0f0f0f] sticky top-0 z-50 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-8 h-full">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 dark:bg-slate-50 rounded-md flex items-center justify-center">
            <Terminal size={18} className="text-slate-50 dark:text-slate-900" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight leading-none text-slate-900 dark:text-slate-50">DevProxy</h1>
            <p className="text-[10px] font-medium text-slate-500 mt-0.5 uppercase tracking-widest">Enterprise Hub</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 h-full pt-px">
          <button
            onClick={() => setActiveTab('webhook')}
            className={cn(
              'relative px-4 h-full flex items-center text-sm font-medium transition-colors',
              activeTab === 'webhook'
                ? 'text-slate-900 dark:text-slate-50'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-50'
            )}
          >
            Intercept
            {activeTab === 'webhook' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 dark:bg-slate-50 rounded-t-md" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('api_request')}
            className={cn(
              'relative px-4 h-full flex items-center text-sm font-medium transition-colors',
              activeTab === 'api_request'
                ? 'text-slate-900 dark:text-slate-50'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-50'
            )}
          >
            API Logs
            {activeTab === 'api_request' && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-900 dark:bg-slate-50 rounded-t-md" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <ConnectionStatus />
      </div>
    </header>
  );
}
