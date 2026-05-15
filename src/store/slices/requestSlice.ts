import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface RequestState {
  name?: string;
  description?: string;
  images?: string[];
  parentCategoryId?: string;
  subCategoryId?: string;
  sizeTierId?: string;
  attributes?: { attributeId: string; value: string; attributeValue: string }[];
  parentCategoryValue?: string;
  subCategoryValue?: string;
}

const initialState: RequestState = {};

const requestSlice = createSlice({
  name: 'request',
  initialState,
  reducers: {
    saveRequest(state, action: PayloadAction<RequestState>) {
      return { ...state, ...action.payload };
    },
    clearRequest() {
      return initialState;
    },
  },
});

export const { saveRequest, clearRequest } = requestSlice.actions;
export default requestSlice.reducer;
