import { useUiStore } from '../store/uiStore';
import type { EventType, WebhookEvent, ApiRequest } from '../types';

export const useDebugPrompt = () => {
  const debugEvent = useUiStore((state) => state.debugEvent);
  const debugEventType = useUiStore((state) => state.debugEventType);
  const openDebugModal = useUiStore((state) => state.openDebugModal);
  const closeDebugModal = useUiStore((state) => state.closeDebugModal);

  return {
    event: debugEvent,
    eventType: debugEventType,
    isOpen: debugEvent !== null,
    open: (type: EventType, event: WebhookEvent | ApiRequest) =>
      openDebugModal(type, event),
    close: closeDebugModal,
  };
};
