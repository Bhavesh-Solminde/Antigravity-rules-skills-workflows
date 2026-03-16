import { create } from 'zustand';
import type { WebhookEvent, FilterState } from '../types';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface WebhookStore {
  webhooks: WebhookEvent[];
  selectedWebhook: WebhookEvent | null;
  loading: boolean;
  filters: FilterState;
  
  fetchWebhooks: (filters?: Partial<FilterState>) => Promise<void>;
  selectWebhook: (event: WebhookEvent | null) => void;
  addWebhook: (event: WebhookEvent) => void;
  replayWebhook: (id: string) => Promise<void>;
  deleteWebhook: (id: string) => Promise<void>;
  clearSelected: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useWebhookStore = create<WebhookStore>((set, get) => ({
  webhooks: [],
  selectedWebhook: null,
  loading: false,
  filters: { limit: 50 },

  fetchWebhooks: async (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ loading: true, filters });
    try {
      const response = await axios.get('/api/webhooks', { params: filters });
      set({ webhooks: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  selectWebhook: (event) => set({ selectedWebhook: event }),

  addWebhook: (event) => set((state) => {
    // Deduplicate — skip if a webhook with this id already exists
    if (state.webhooks.some((w) => w.id === event.id)) {
      return state;
    }
    const newWebhooks = [event, ...state.webhooks].slice(0, state.filters.limit);
    return { webhooks: newWebhooks };
  }),

  replayWebhook: async (id) => {
    try {
      await axios.post(`/api/webhooks/${id}/replay`);
      toast.success('Webhook replayed successfully');
    } catch (error) {
    }
  },

  deleteWebhook: async (id) => {
    try {
      await axios.delete(`/api/webhooks/${id}`);
      set((state) => ({
        webhooks: state.webhooks.filter((w) => w.id !== id),
        selectedWebhook: state.selectedWebhook?.id === id ? null : state.selectedWebhook
      }));
      toast.success('Webhook deleted');
    } catch (error) {
    }
  },

  clearSelected: () => set({ selectedWebhook: null }),

  setFilters: (newFilters) => {
    get().fetchWebhooks(newFilters);
  }
}));
