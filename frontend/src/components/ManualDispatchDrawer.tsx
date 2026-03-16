import { useEffect, useRef } from 'react';
import { ProxyRequestForm } from './ProxyRequestForm';
import { X } from 'lucide-react';

interface ManualDispatchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManualDispatchDrawer({ isOpen, onClose }: ManualDispatchDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      // Small delay to avoid closing immediately on the same click that opens
      const id = setTimeout(() => document.addEventListener('mousedown', handleOutside), 100);
      return () => {
        clearTimeout(id);
        document.removeEventListener('mousedown', handleOutside);
      };
    }
    return undefined;
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Desktop: slide from right | Mobile: slide from bottom */}
      <div
        ref={drawerRef}
        className={`
          fixed z-50 bg-white dark:bg-[#0f0f0f] border-l border-slate-200 dark:border-white/5 shadow-2xl
          transition-transform duration-300 ease-out
          
          /* Desktop */
          top-0 right-0 h-full w-[480px]
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}

          /* Mobile override */
          max-sm:top-auto max-sm:bottom-0 max-sm:left-0 max-sm:right-0 max-sm:w-full max-sm:h-[85vh]
          max-sm:rounded-t-2xl max-sm:border-l-0 max-sm:border-t
          ${isOpen ? 'max-sm:translate-y-0' : 'max-sm:translate-y-full'}
          max-sm:translate-x-0
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0c0c0c]">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Manual Dispatch
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="overflow-y-auto custom-scrollbar h-[calc(100%-57px)]">
          <ProxyRequestForm />
        </div>
      </div>
    </>
  );
}
