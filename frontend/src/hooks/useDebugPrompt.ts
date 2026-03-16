import { useUiStore } from '../store/uiStore';
import type { EventType } from '../types';

export const useDebugPrompt = () => {
  const debugPrompt = useUiStore((state) => state.debugPrompt);
  const debugPromptLoading = useUiStore((state) => state.debugPromptLoading);
  const generateDebugPrompt = useUiStore((state) => state.generateDebugPrompt);
  const clearDebugPrompt = useUiStore((state) => state.clearDebugPrompt);

  return {
    prompt: debugPrompt,
    loading: debugPromptLoading,
    generate: (type: EventType, eventId: string) => generateDebugPrompt(type, eventId),
    clear: clearDebugPrompt
  };
};
