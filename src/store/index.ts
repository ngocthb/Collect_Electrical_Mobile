import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import requestReducer from './slices/requestSlice';
import addressReducer from './slices/addressSlice';
import timeSlots from './slices/timeSlotSlice';
import deliveryConfirmImage from './slices/deliveryConfirmImage';
import systemConfig from './slices/systemSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,
    request: requestReducer,
    address: addressReducer,
    timeSlots: timeSlots,
    deliveryConfirmImage: deliveryConfirmImage,
    systemConfig: systemConfig,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
