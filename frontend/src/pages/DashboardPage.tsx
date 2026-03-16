import { useEffect } from 'react';
import { useUiStore } from '../store/uiStore';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import { useSocket } from '../hooks/useSocket';
import { StatsSummary } from '../components/StatsSummary';
import { FilterBar } from '../components/FilterBar';
import { EventList } from '../components/EventList';
import { EventDetailPanel } from '../components/EventDetailPanel';
import { ProxyRequestForm } from '../components/ProxyRequestForm';

export function DashboardPage() {
  const activeTab = useUiStore((state) => state.activeTab);
  
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
    <div className="flex flex-col h-full w-full absolute inset-0 bg-[#0a0a0c]">
      
      {/* Top Chrome: Stats & Filters */}
      <div className="flex flex-col shrink-0 z-20">
        <StatsSummary type={activeTab} />
        {activeTab === 'api_request' && <ProxyRequestForm />}
        <FilterBar type={activeTab} />
      </div>

      {/* Main Split View */}
      <div className="flex flex-1 overflow-hidden relative z-10 w-full">
        
        {/* Left: Event List (Fixed width or minmax) */}
        <div className="w-[450px] shrink-0 border-r border-zinc-800/80 bg-zinc-950/40 overflow-hidden flex flex-col h-full z-20 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.5)]">
          <EventList 
            type={activeTab}
            events={isWebhook ? webhooks : apiRequests}
            selectedId={isWebhook ? selectedWebhook?._id : selectedRequest?._id}
            onSelect={(e) => isWebhook ? selectWebhook(e as any) : selectRequest(e as any)}
            loading={isWebhook ? webhookLoading : apiLoading}
          />
        </div>

        {/* Right: Event Details */}
        <div className="flex-1 overflow-hidden flex flex-col h-full bg-[#09090b] relative z-10 max-w-full">
          <EventDetailPanel 
            type={activeTab}
            event={isWebhook ? selectedWebhook : selectedRequest}
          />
        </div>

      </div>
    </div>
  );
}
