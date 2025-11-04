import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Address } from '../../types/address';

interface AddressState {
  list: Address[]; // danh sách địa chỉ
  current: Address; // địa chỉ đang chọn / đang tạo
  lastAddedId: string | null; // ID của address vừa được thêm
}

const initialAddress: Address = {
  id: '0',
  name: '',
  phone: '',
  address: '',
  latitude: 0,
  longitude: 0,
};

const initialState: AddressState = {
  list: [],
  current: initialAddress,
  lastAddedId: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    saveAddress(state, action: PayloadAction<Partial<Address>>) {
      Object.assign(state.current, action.payload);
    },

    addAddress(state, action: PayloadAction<Address>) {
      state.list.push(action.payload);
      state.lastAddedId = action.payload.id;
      state.current = initialAddress;
    },

    updateAddress(state, action: PayloadAction<Address>) {
      const idx = state.list.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) {
        state.list[idx] = action.payload;
      }
      state.current = initialAddress;
    },

    clearAddress(state) {
      state.current = initialAddress;
    },

    setAddressList(state, action: PayloadAction<Address[]>) {
      state.list = action.payload;
    },

    clearLastAddedId(state) {
      state.lastAddedId = null;
    },
  },
});

export const {
  saveAddress,
  addAddress,
  updateAddress,
  clearAddress,
  setAddressList,
  clearLastAddedId,
} = addressSlice.actions;
export default addressSlice.reducer;
