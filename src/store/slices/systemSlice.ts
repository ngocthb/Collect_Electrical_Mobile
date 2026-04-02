import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  publicHoliday,
  ServerTime,
  systemConfig,
} from '../../types/SystemConfig';

interface SystemState {
  publicHoliday: publicHoliday[];
  radiusMeter: systemConfig | null;
  timeToPost: systemConfig | null;
  timeSever: ServerTime | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SystemState = {
  publicHoliday: [],
  radiusMeter: null,
  timeSever: null,
  timeToPost: null,
  isLoading: false,
  error: null,
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setAllConfig(
      state,
      action: PayloadAction<{
        radiusMeter: systemConfig;
        timeToPost: systemConfig;
        publicHoliday: publicHoliday[];
        timeServe: ServerTime;
      }>,
    ) {
      state.radiusMeter = action.payload.radiusMeter;
      state.timeToPost = action.payload.timeToPost;
      state.publicHoliday = action.payload.publicHoliday;
      state.timeSever = action.payload.timeServe;
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setAllConfig, setLoading, setError } = systemSlice.actions;

export default systemSlice.reducer;
