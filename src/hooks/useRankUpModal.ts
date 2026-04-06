import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMyRank } from '../services/leaderboardService';
import {
  getRankUpPayload,
  isRankUp,
  PENDING_RANK_UP_KEY,
  normalizeRank,
  RankName,
  RankUpPayload,
} from '../utils/rankUtils';

type RankUpModalState = {
  visible: boolean;
  fromRank: RankName;
  toRank: RankName;
};

export const useRankUpModal = (userId?: string, canShowModal = false) => {
  const [rankUpModal, setRankUpModal] = useState<RankUpModalState>({
    visible: false,
    fromRank: 'dong',
    toRank: 'bac',
  });
  const [pendingRankUp, setPendingRankUp] = useState<RankUpPayload | null>(
    null,
  );

  const rankStorageKey = `current_rank_${userId}`;

  const showOrQueueModal = useCallback(
    (payload: RankUpPayload) => {
      if (canShowModal) {
        setRankUpModal({
          visible: true,
          fromRank: payload.fromRank,
          toRank: payload.toRank,
        });
        setPendingRankUp(null);
      } else {
        setPendingRankUp(payload);
      }
    },
    [canShowModal],
  );

  const showRankUpModal = useCallback(
    async ({ fromRank, toRank }: RankUpPayload) => {
      if (!isRankUp(fromRank, toRank)) return;

      showOrQueueModal({ fromRank, toRank });

      await AsyncStorage.setItem(rankStorageKey, toRank);
    },
    [rankStorageKey, showOrQueueModal],
  );

  const closeRankUpModal = useCallback(() => {
    setRankUpModal(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const consumePendingRankUp = useCallback(async () => {
    if (!userId) return;

    try {
      const pendingRaw = await AsyncStorage.getItem(PENDING_RANK_UP_KEY);
      if (!pendingRaw) return;

      await AsyncStorage.removeItem(PENDING_RANK_UP_KEY);

      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(pendingRaw) as Record<string, unknown>;
      } catch {
        return;
      }

      const payload = getRankUpPayload(parsed);
      if (!payload || !isRankUp(payload.fromRank, payload.toRank)) return;

      showOrQueueModal(payload);
      await AsyncStorage.setItem(rankStorageKey, payload.toRank);
    } catch (error) {
      console.warn('[Rank] Failed to consume pending rank-up payload', error);
    }
  }, [rankStorageKey, showOrQueueModal, userId]);

  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    const checkRankProgress = async () => {
      try {
        const rankResponse = await getMyRank(userId);
        const rankData = rankResponse?.data ?? rankResponse;
        const currentRank = normalizeRank(rankData?.currentRankName);
        if (!currentRank || !mounted) return;

        const savedRankRaw = await AsyncStorage.getItem(rankStorageKey);
        const savedRank = normalizeRank(savedRankRaw);

        if (savedRank && isRankUp(savedRank, currentRank)) {
          showOrQueueModal({
            fromRank: savedRank,
            toRank: currentRank,
          });
        }

        await AsyncStorage.setItem(rankStorageKey, currentRank);
      } catch (error) {
        console.warn('[Rank] Failed to check rank progress', error);
      }
    };

    checkRankProgress();
    consumePendingRankUp();

    return () => {
      mounted = false;
    };
  }, [consumePendingRankUp, rankStorageKey, showOrQueueModal, userId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') {
        consumePendingRankUp();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [consumePendingRankUp]);

  useEffect(() => {
    if (!canShowModal || !pendingRankUp || rankUpModal.visible) return;

    setRankUpModal({
      visible: true,
      fromRank: pendingRankUp.fromRank,
      toRank: pendingRankUp.toRank,
    });
    setPendingRankUp(null);
  }, [canShowModal, pendingRankUp, rankUpModal.visible]);

  return {
    rankUpModal,
    showRankUpModal,
    closeRankUpModal,
  };
};
