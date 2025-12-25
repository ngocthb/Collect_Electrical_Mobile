import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { initZegoService, uninitZegoService } from '../config/zego';
/**
 * Hook này tự động init và uninit Zego khi user login/logout
 */
export function useZegoService() {
  const { user } = useAppSelector(s => s.auth);
  const initializedUserIdRef = useRef<string | null>(null);
  const isInitializingRef = useRef(false);
  useEffect(() => {
    const setupZego = async () => {
      if (user?.userId && user?.name && user?.avatar) {
        const cleanUserId = user.userId.replace(/[^a-zA-Z0-9_]/g, '');
        if (
          initializedUserIdRef.current === cleanUserId ||
          isInitializingRef.current
        ) {
          return;
        }
        try {
          isInitializingRef.current = true;
          // ✅ Delay nhỏ để tránh race condition với navigation
          await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
          const cleanName = user.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .trim();
          await initZegoService(
            cleanUserId,
            cleanName,
            user.avatar,
            duration => {
              console.log('[ZegoHook] Cuộc gọi kết thúc sau', duration, 'giây');
            },
          );
          initializedUserIdRef.current = cleanUserId;
        } catch (error) {
          console.error('[ZegoHook] ❌ Init thất bại:', error);
          initializedUserIdRef.current = null;
        } finally {
          isInitializingRef.current = false;
        }
      } else if (!user && initializedUserIdRef.current) {
        try {
          await uninitZegoService();
          initializedUserIdRef.current = null;
        } catch (error) {
          console.error('[ZegoHook] ❌ Uninit thất bại:', error);
        }
      }
    };
    setupZego();
  }, [user?.userId]);
  useEffect(() => {
    return () => {
      if (initializedUserIdRef.current) {
        uninitZegoService().catch(console.error);
      }
    };
  }, []);
}


