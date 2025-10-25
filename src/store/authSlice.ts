import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PendingRegistration {
  username: string;
  email: string;
  phone?: string;
  password: string;
  verified?: boolean;
}

export interface UserState {
  user: { email: string; name?: string } | null;
  role: 'user' | 'delivery' | null;
  loading: boolean;
  error: string | null;
  pendingRegistration: PendingRegistration | null;
}

const initialState: UserState = {
  user: null,
  role: null,
  loading: false,
  error: null,
  pendingRegistration: null,
};

// Mock register: keep for backwards compatibility — not used in new flow
export const registerMock = createAsyncThunk(
  'auth/registerMock',
  async (payload: {
    email: string;
    password: string;
    phone?: string;
    username?: string;
  }) => {
    const { email } = payload;
    // Simulate network latency
    await new Promise<void>(resolve => setTimeout(resolve, 600));

    if (email.includes('delivery')) {
      return { user: { email }, role: 'delivery' as const };
    }

    return { user: { email }, role: 'user' as const };
  },
);

// Login thunk: validate against pendingRegistration (after verify)
export const loginMock = createAsyncThunk(
  'auth/loginMock',
  async (
    payload: { identifier: string; password: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as { auth: UserState };
    const pending = state.auth.pendingRegistration;
    // Simulate latency
    await new Promise<void>(resolve => setTimeout(resolve, 400));

    if (pending && pending.verified) {
      const { identifier, password } = payload;
      const matchesIdentifier =
        identifier === pending.username || identifier === pending.email;
      if (matchesIdentifier && password === pending.password) {
        // decide role from email
        const role = pending.email.includes('delivery') ? 'delivery' : 'user';
        return { user: { email: pending.email, name: pending.username }, role };
      }
      return rejectWithValue('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    // fallback: reject if no pending/verified registration
    return rejectWithValue('Tài khoản chưa được xác thực hoặc không tồn tại');
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.role = null;
      state.error = null;
      state.pendingRegistration = null;
    },
    // store pending registration until user verifies
    setPendingRegistration(state, action: PayloadAction<PendingRegistration>) {
      state.pendingRegistration = { ...action.payload, verified: false };
      state.error = null;
    },
    verifyPendingRegistration(state) {
      if (state.pendingRegistration) state.pendingRegistration.verified = true;
    },
    clearPendingRegistration(state) {
      state.pendingRegistration = null;
    },
    // Synchronous helpers
    setUser(
      state,
      action: PayloadAction<{ email: string; name?: string } | null>,
    ) {
      state.user = action.payload;
    },
    setRole(state, action: PayloadAction<'user' | 'delivery' | null>) {
      state.role = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(registerMock.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      registerMock.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.error = null;
      },
    );
    builder.addCase(registerMock.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error.message || 'Lỗi đăng ký';
    });

    // loginMock handlers
    builder.addCase(loginMock.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      loginMock.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.error = null;
        // clear pending registration after successful login
        state.pendingRegistration = null;
      },
    );
    builder.addCase(loginMock.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error.message || 'Lỗi đăng nhập';
    });
  },
});

export const {
  logout,
  setPendingRegistration,
  verifyPendingRegistration,
  clearPendingRegistration,
  setError,
} = authSlice.actions;

export default authSlice.reducer;
