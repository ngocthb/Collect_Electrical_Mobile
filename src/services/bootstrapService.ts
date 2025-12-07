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

      // Fetch addresses after successful login
      try {
        const addresses = await getUserAddresses(result.profile.userId);
        dispatch(setAddressList(addresses || []));
        console.log('[Bootstrap] Loaded addresses:', addresses?.length || 0);
      } catch (err) {
        console.warn('[Bootstrap] Failed to load addresses:', err);
      }
    }
  } catch (e) {
    console.warn('[Bootstrap] error', e);
  } finally {
    dispatch(setLoading(false));
  }
};
