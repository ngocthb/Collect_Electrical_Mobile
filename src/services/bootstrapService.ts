import { bootstrapAuth } from './authService';
import { getUserAddresses } from '../services/addressService';
import { setUser, setLoading } from '../store/slices/authSlice';
import { setAddressList } from '../store/slices/addressSlice';
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
      }
    }
  } catch (e) {
    console.warn('[Bootstrap] error', e);
  } finally {
    dispatch(setLoading(false));
  }
};
