import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeliveryConfirmImageState {
  imageUrls: string[];
}

const initialState: DeliveryConfirmImageState = {
  imageUrls: [],
};

const deliveryConfirmImageSlice = createSlice({
  name: 'deliveryConfirmImage',
  initialState,
  reducers: {
    saveImageUrls(state, action: PayloadAction<string[]>) {
      state.imageUrls = action.payload;
    },

    clearImageUrls(state) {
      state.imageUrls = [];
    },
  },
});

export const { saveImageUrls, clearImageUrls } =
  deliveryConfirmImageSlice.actions;
export default deliveryConfirmImageSlice.reducer;
