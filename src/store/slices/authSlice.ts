import { User } from '../../types/index';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = true;
    },

    logout: state => {
      AsyncStorage.clear(); // Clear all stored data on logout
      state.user = null;
      state.isLoading = false;
      state.error = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setUser, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
