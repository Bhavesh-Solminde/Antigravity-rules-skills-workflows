import { create } from 'zustand';
import type { ApiRequest, FilterState } from '../types';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface ProxyRequestData {
  method: string;
  endpoint: string;
  headers?: Record<string, string>;
  payload?: Record<string, unknown> | string;
}

interface ApiRequestStore {
  apiRequests: ApiRequest[];
  selectedRequest: ApiRequest | null;
  loading: boolean;
  filters: FilterState;

  fetchApiRequests: (filters?: Partial<FilterState>) => Promise<void>;
  selectRequest: (req: ApiRequest | null) => void;
  addApiRequest: (req: ApiRequest) => void;
  sendProxyRequest: (data: ProxyRequestData) => Promise<void>;
  replayApiRequest: (id: string) => Promise<void>;
  deleteApiRequest: (id: string) => Promise<void>;
  clearSelected: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
}

export const useApiRequestStore = create<ApiRequestStore>((set, get) => ({
  apiRequests: [],
  selectedRequest: null,
  loading: false,
  filters: { limit: 50 },

  fetchApiRequests: async (newFilters) => {
    const filters = { ...get().filters, ...newFilters };
    set({ loading: true, filters });
    try {
      const response = await axios.get('/api/api-requests', { params: filters });
      set({ apiRequests: response.data.data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  },

  selectRequest: (req) => set({ selectedRequest: req }),

  addApiRequest: (req) => set((state) => {
    // Deduplicate — skip if a request with this id already exists
    if (state.apiRequests.some((r) => r.id === req.id)) {
      return state;
    }
    const newRequests = [req, ...state.apiRequests].slice(0, state.filters.limit);
    return { apiRequests: newRequests };
  }),

  sendProxyRequest: async (data) => {
    set({ loading: true });
    try {
      await axios.post('/api/api-requests/proxy', data);
      toast.success('Proxy request dispatched');
    } catch (error) {
      toast.error('Error dispatching request');
    } finally {
      set({ loading: false });
    }
  },

  replayApiRequest: async (id) => {
    try {
      await axios.post(`/api/api-requests/${id}/replay`);
      toast.success('API Request replayed successfully');
    } catch (error) {
      toast.error('Error replaying request');
    }
  },

  deleteApiRequest: async (id) => {
    try {
      await axios.delete(`/api/api-requests/${id}`);
      set((state) => ({
        apiRequests: state.apiRequests.filter((r) => r.id !== id),
        selectedRequest: state.selectedRequest?.id === id ? null : state.selectedRequest
      }));
      toast.success('API Request deleted');
    } catch (error) {
    }
  },

  clearSelected: () => set({ selectedRequest: null }),

  setFilters: (newFilters) => {
    get().fetchApiRequests(newFilters);
  }
}));
