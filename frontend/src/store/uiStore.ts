import { create } from 'zustand';
import type { EventType, WebhookEvent, ApiRequest } from '../types';
import axios from '../lib/axios';

interface UiStore {
  activeTab: EventType;
  sidebarOpen: boolean;

  // AI Debug Modal state
  debugEvent: WebhookEvent | ApiRequest | null;
  debugEventType: EventType | null;

  setActiveTab: (tab: EventType) => void;
  toggleSidebar: () => void;
  openDebugModal: (type: EventType, event: WebhookEvent | ApiRequest) => void;
  closeDebugModal: () => void;

  // Legacy prompt field (used by prompt-only endpoint)
  debugPrompt: string | null;
  debugPromptLoading: boolean;
  generateDebugPrompt: (type: EventType, eventId: string) => Promise<void>;
  clearDebugPrompt: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: 'webhook',
  sidebarOpen: true,

  debugEvent: null,
  debugEventType: null,

  debugPrompt: null,
  debugPromptLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openDebugModal: (type, event) =>
    set({ debugEventType: type, debugEvent: event }),

  closeDebugModal: () =>
    set({ debugEvent: null, debugEventType: null }),

  generateDebugPrompt: async (type, eventId) => {
    set({ debugPromptLoading: true, debugPrompt: null });
    try {
      const response = await axios.post('/api/ai-debug/prompt', { type, eventId });
      set({ debugPrompt: response.data.data.prompt, debugPromptLoading: false });
    } catch (error) {
      set({ debugPromptLoading: false });
      console.error(error);
      import("react-hot-toast").then((m) => m.default.error("Failed to generate AI prompt"));
    }
  },

  clearDebugPrompt: () => set({ debugPrompt: null })
}));
