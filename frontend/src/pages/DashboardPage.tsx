import { useEffect, useState } from 'react';
import { useUiStore } from '../store/uiStore';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { useSocket } from '../hooks/useSocket';
import { StatsSummary } from '../components/StatsSummary';
import { FilterBar } from '../components/FilterBar';
import { EventList } from '../components/EventList';
import { EventDetailPanel } from '../components/EventDetailPanel';
import { ManualDispatchDrawer } from '../components/ManualDispatchDrawer';

export function DashboardPage() {
  const activeTab = useUiStore((state) => state.activeTab);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Socket init
  useSocket();

  // Webhook State
  const { 
    webhooks, 
    selectedWebhook, 
    loading: webhookLoading,
    fetchWebhooks,
    selectWebhook
  } = useWebhookStore();

  // API Request State
  const { 
    apiRequests, 
    selectedRequest, 
    loading: apiLoading,
    fetchApiRequests,
    selectRequest
  } = useApiRequestStore();

  // Initial fetch
  useEffect(() => {
    fetchWebhooks();
    fetchApiRequests();
  }, [fetchWebhooks, fetchApiRequests]);

  const isWebhook = activeTab === 'webhook';

  return (
    <div className="flex flex-col h-full w-full absolute inset-0 bg-slate-50 dark:bg-[#0a0a0a]">
      
      {/* Top Chrome: Stats & Filters */}
      <div className="flex flex-col shrink-0 z-20">
        <StatsSummary type={activeTab} />
        <FilterBar
          type={activeTab}
          onManualDispatch={() => setDrawerOpen(true)}
        />
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        
        {/* Left: Event List */}
        <aside className="w-[380px] shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#0c0c0c] overflow-hidden flex flex-col h-full z-20">
          <EventList 
            type={activeTab}
            events={isWebhook ? webhooks : apiRequests}
            selectedId={isWebhook ? selectedWebhook?._id : selectedRequest?._id}
            onSelect={(e) => isWebhook ? selectWebhook(e as never) : selectRequest(e as never)}
            loading={isWebhook ? webhookLoading : apiLoading}
          />
        </aside>

        {/* Right: Event Details */}
        <section className="flex-1 overflow-hidden flex flex-col h-full bg-white dark:bg-[#0a0a0a] relative z-10 max-w-full">
          <EventDetailPanel 
            type={activeTab}
            event={isWebhook ? selectedWebhook : selectedRequest}
          />
        </section>

      </div>

      {/* Manual Dispatch Drawer */}
      <ManualDispatchDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
