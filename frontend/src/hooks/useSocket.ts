import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useWebhookStore } from '../store/webhookStore';
import { useApiRequestStore } from '../store/apiRequestStore';
import type { WebhookEvent, ApiRequest } from '../types';

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const addWebhook = useWebhookStore((state) => state.addWebhook);
  const addApiRequest = useApiRequestStore((state) => state.addApiRequest);

  useEffect(() => {
    const socket: Socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('new_webhook', (event: WebhookEvent) => {
      addWebhook(event);
      toast.success('New Webhook Captured', { id: `webhook-${event._id}` });
    });

    socket.on('new_api_request', (req: ApiRequest) => {
      addApiRequest(req);
      toast.success('New API Request Captured', { id: `api-${req._id}` });
    });

    return () => {
      socket.disconnect();
    };
  }, [addWebhook, addApiRequest]);

  return { connected };
};
