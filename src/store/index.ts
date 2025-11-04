import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import requestReducer from './slices/requestSlice';
import addressReducer from './slices/addressSlice';
import timeSlots from './slices/timeSlotSlice';
import deliveryConfirmImage from './slices/deliveryConfirmImage';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    request: requestReducer,
    address: addressReducer,
    timeSlots: timeSlots,
    deliveryConfirmImage: deliveryConfirmImage,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
