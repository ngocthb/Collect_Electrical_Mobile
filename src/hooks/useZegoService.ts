import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { initZegoService, uninitZegoService } from '../config/zego';

export function useZegoService() {
  const { user } = useAppSelector(s => s.auth);
  const initializedUserIdRef = useRef<string | null>(null);
  const isInitializingRef = useRef(false);

  useEffect(() => {
    const setupZego = async () => {
      if (!user?.userId) return;

      const cleanUserId = user.userId.replace(/[^a-zA-Z0-9_]/g, '');

      if (
        initializedUserIdRef.current === cleanUserId ||
        isInitializingRef.current
      ) {
        return;
      }

      try {
        isInitializingRef.current = true;

        await initZegoService(
          cleanUserId,
          user.name ?? 'User',
          user.avatar ?? '',
          duration => {
            console.log('[ZegoHook] Call ended', duration);
          },
        );

        initializedUserIdRef.current = cleanUserId;
      } catch (e) {
        console.error('[ZegoHook] init failed', e);
        initializedUserIdRef.current = null;
      } finally {
        isInitializingRef.current = false;
      }
    };

    setupZego();
  }, [user?.userId]);

  // ❗ CHỈ uninit khi logout
  useEffect(() => {
    if (!user && initializedUserIdRef.current) {
      uninitZegoService().catch(console.error);
      initializedUserIdRef.current = null;
    }
  }, [user]);
}
