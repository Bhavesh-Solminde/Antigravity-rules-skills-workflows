import { create } from 'zustand';
import type { EventType } from '../types';
import axios from '../lib/axios';

interface UiStore {
  activeTab: EventType;
  sidebarOpen: boolean;
  debugPrompt: string | null;
  debugPromptLoading: boolean;

  setActiveTab: (tab: EventType) => void;
  toggleSidebar: () => void;
  generateDebugPrompt: (type: EventType, eventId: string) => Promise<void>;
  clearDebugPrompt: () => void;
}

export const useUiStore = create<UiStore>((set) => ({
  activeTab: 'webhook',
  sidebarOpen: true,
  debugPrompt: null,
  debugPromptLoading: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  generateDebugPrompt: async (type, eventId) => {
    set({ debugPromptLoading: true, debugPrompt: null });
    try {
      const response = await axios.post('/api/ai-debug/prompt', { type, eventId });
      set({ debugPrompt: response.data.data.prompt, debugPromptLoading: false });
    } catch (error) {
      set({ debugPromptLoading: false });
    }
  },

  clearDebugPrompt: () => set({ debugPrompt: null })
}));
