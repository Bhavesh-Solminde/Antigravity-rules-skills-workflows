import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import type { WebhookEvent, ApiRequest } from '../types';

// ── Singleton socket instance — created once at module level ────────────────
const socket: Socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
  transports: ['websocket'],
});

export const useSocket = () => {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onNewWebhook = (event: WebhookEvent) => {
      // Use getState() to avoid stale closures — always gets the latest action
      useWebhookStore.getState().addWebhook(event);
      toast.success('New Webhook Captured', { id: `webhook-${event._id}` });
    };

    const onNewApiRequest = (req: ApiRequest) => {
      useApiRequestStore.getState().addApiRequest(req);
      toast.success('New API Request Captured', { id: `api-${req._id}` });
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_webhook', onNewWebhook);
    socket.on('new_api_request', onNewApiRequest);

    // If already connected when the hook mounts, set state immediately
    if (socket.connected) {
      setConnected(true);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_webhook', onNewWebhook);
      socket.off('new_api_request', onNewApiRequest);
    };
  }, []); // Empty deps — socket is a singleton, listeners use getState()

  return { connected };
};
