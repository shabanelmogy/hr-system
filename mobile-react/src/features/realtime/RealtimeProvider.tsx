import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';
import { z } from 'zod';

import { realtimeService } from '@/src/core/realtime/realtime-service';
import { useAuth } from '@/src/features/auth';
import { showToast } from '@/src/shared/components/feedback/transient';
import { parseRealtimeEntityChanged } from './realtime-event';
import {
  getAllRealtimeQueryKeys,
  getRealtimeQueryKeys,
  isKnownRealtimeResource,
  resourceAffectsSession,
} from './realtime-query-registry';

interface RealtimeContextValue {
  isConnected: boolean;
  isConnecting: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  isConnected: false,
  isConnecting: false,
});

const maxRecentEvents = 500;
const notificationSchema = z.object({
  id: z.number().int().positive(),
  actorUserId: z.string().nullable().optional(),
});

export function RealtimeProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { status, session, refreshSession, signOut } = useAuth();
  const [connectionState, setConnectionState] = useState<RealtimeContextValue>({
    isConnected: false,
    isConnecting: false,
  });
  const wasConnected = useRef(false);
  const recentEventIds = useRef(new Set<string>());
  const receivedNotificationIds = useRef(new Set<number>());

  useEffect(
    () =>
      realtimeService.subscribe((isConnected, isConnecting) => {
        setConnectionState({ isConnected, isConnecting });
      }),
    [],
  );

  useEffect(() => {
    const updateConnection = (appState: string) => {
      const shouldEnable = status === 'authenticated' && appState === 'active';
      if (!shouldEnable) {
        void realtimeService.setEnabled(false);
        return;
      }

      void realtimeService.setEnabled(false).then(() => realtimeService.setEnabled(true));
    };

    updateConnection(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateConnection);
    return () => {
      subscription.remove();
      void realtimeService.setEnabled(false);
    };
  }, [session?.companyId, session?.tenantId, status]);

  useEffect(() => {
    const receiveEntityChanged = (...args: unknown[]) => {
      const change = parseRealtimeEntityChanged(args[0]);
      if (!change || recentEventIds.current.has(change.eventId)) return;

      recentEventIds.current.add(change.eventId);
      if (recentEventIds.current.size > maxRecentEvents) {
        const oldestEventId = recentEventIds.current.values().next().value;
        if (oldestEventId) recentEventIds.current.delete(oldestEventId);
      }

      const queryKeys = getRealtimeQueryKeys(change.resource);
      queryKeys.forEach((queryKey) => {
        void queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
      });

      // Unknown resources deliberately fall back to active-query invalidation.
      // This keeps newly added backend modules live until a narrow mapping is added.
      if (!isKnownRealtimeResource(change.resource)) {
        void queryClient.invalidateQueries({ refetchType: 'active' });
      }

      if (resourceAffectsSession(change.resource)) {
        void refreshSession().catch((error: unknown) => {
          console.warn('[SignalR] Session refresh delayed', error);
        });
      }
    };

    const receiveTokenRevoked = (...args: unknown[]) => {
      const message = typeof args[0] === 'string' ? args[0] : 'Your session was revoked.';
      showToast.warning(message);
      void signOut();
    };

    const receiveNotification = (...args: unknown[]) => {
      const result = notificationSchema.safeParse(args[0]);
      if (!result.success || receivedNotificationIds.current.has(result.data.id)) return;

      receivedNotificationIds.current.add(result.data.id);
      if (receivedNotificationIds.current.size > 200) {
        const oldestId = receivedNotificationIds.current.values().next().value;
        if (oldestId !== undefined) receivedNotificationIds.current.delete(oldestId);
      }

      for (const queryKey of getRealtimeQueryKeys('notifications')) {
        void queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
      }
      if (!result.data.actorUserId || result.data.actorUserId !== session?.userId) {
        showToast.info(t('feedback.liveUpdate'));
      }
    };

    realtimeService.on('ReceiveEntityChanged', receiveEntityChanged);
    realtimeService.on('ReceiveTokenRevoked', receiveTokenRevoked);
    realtimeService.on('ReceiveNotification', receiveNotification);
    return () => {
      realtimeService.off('ReceiveEntityChanged', receiveEntityChanged);
      realtimeService.off('ReceiveTokenRevoked', receiveTokenRevoked);
      realtimeService.off('ReceiveNotification', receiveNotification);
    };
  }, [queryClient, refreshSession, session?.userId, signOut, t]);

  useEffect(() => {
    if (connectionState.isConnected && !wasConnected.current) {
      for (const queryKey of getAllRealtimeQueryKeys()) {
        void queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
      }
      void refreshSession().catch((error: unknown) => {
        console.warn('[SignalR] Reconnect session refresh delayed', error);
      });
    }
    wasConnected.current = connectionState.isConnected;
  }, [connectionState.isConnected, queryClient, refreshSession]);

  return (
    <RealtimeContext.Provider value={connectionState}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtimeConnection(): RealtimeContextValue {
  return useContext(RealtimeContext);
}
