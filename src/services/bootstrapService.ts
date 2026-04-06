import { bootstrapAuth } from './authService';
import { getUserAddresses } from '../services/addressService';
import { setUser, setLoading } from '../store/slices/authSlice';
import { setAddressList } from '../store/slices/addressSlice';
import { getMyRank } from './leaderboardService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUnReadNotis } from './notificationServices';
import { setUnRead } from '../store/slices/notificationSlice';
import type { AppDispatch } from '../store';

export const bootstrapApp = async (dispatch: AppDispatch) => {
  try {
    dispatch(setLoading(true));
    const result = await bootstrapAuth();
    if (result.success && result.profile) {
      dispatch(setUser(result.profile));

      if (result.role === 'user') {
        const addresses = await getUserAddresses(result.profile.userId);
        dispatch(setAddressList(addresses));
        const myRank = await getMyRank(result.profile.userId);
        await AsyncStorage.setItem(
          `current_rank_${result.profile.userId}`,
          myRank?.currentRankName,
        );
        const unReadNoti = await getUnReadNotis(result.profile.userId);

        dispatch(setUnRead(unReadNoti.unreadCount || 0));
      }
    }
  } catch (e) {
    console.warn('[Bootstrap] error', e);
  } finally {
    dispatch(setLoading(false));
  }
};
