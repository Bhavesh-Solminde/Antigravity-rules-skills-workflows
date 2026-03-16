import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DebugPromptModal } from '../components/DebugPromptModal';

export function DashboardLayout() {
  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-50 overflow-hidden font-sans transition-colors duration-300">
      <Navbar />
      <main className="flex-1 overflow-hidden relative w-full h-full">
        <Outlet />
      </main>
      <DebugPromptModal />
    </div>
  );
}
