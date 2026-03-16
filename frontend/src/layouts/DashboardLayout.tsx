import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { DebugPromptModal } from '../components/DebugPromptModal';

export function DashboardLayout() {
  return (
    <div className="flex flex-col h-[100dvh] w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500/30">
      <Navbar />
      <main className="flex-1 overflow-hidden relative w-full h-full">
        <Outlet />
      </main>
      <DebugPromptModal />
    </div>
  );
}
