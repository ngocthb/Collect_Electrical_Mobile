import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    unRead: 0,
  },
  reducers: {
    setUnRead(state, action: PayloadAction<number>) {
      state.unRead = action.payload;
    },
    readNotis(state, action: PayloadAction<number>) {
      state.unRead = state.unRead - action.payload;
    },
  },
});

export const { setUnRead, readNotis } = notificationSlice.actions;
export default notificationSlice.reducer;
