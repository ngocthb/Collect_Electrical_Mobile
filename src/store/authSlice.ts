import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import axiosClient from '../config/axios';
import authService from '../services/authService';

export interface PendingRegistration {
  username: string;
  email: string;
  phone?: string;
  password: string;
  verified?: boolean;
}

export interface UserState {
  user: {
    email: string;
    name?: string;
    userId?: string;
    phone?: string;
    address?: string;
    avatar?: string;
    googleId?: string;
    givenName?: string;
    familyName?: string;
    firebaseUid?: string;
  } | null;
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

const mockUsers = [
  {
    userId: '7f5c8b33-1b52-4d11-91b0-932c3d243c71',
    name: 'Trần Huỳnh Bảo Ngọc',
    email: 'ngocthbse183850@fpt.edu.vn',
    phone: '0901234567',
    address:
      'Vinhomes Grand Park – Nguyễn Xiển, Phường Long Thạnh Mỹ, TP. Thủ Đức',
    avatar: 'https://picsum.photos/id/1011/200/200',
    iat: 10.842003,
    ing: 106.82958,
    role: 'User',
    smallCollectionPointId: 0,
  },
  {
    userId: 'b73a62a7-8b90-43cf-9ad7-2abf96f34a52',
    name: 'Lê Thị Mai',
    email: 'le.thi.mai@example.com',
    phone: '0987654321',
    address:
      'Vincom Mega Mall Grand Park – Đường Nguyễn Xiển, Phường Long Thạnh Mỹ, TP. Thủ Đức',
    avatar: 'https://picsum.photos/id/1025/200/200',
    iat: 10.84345,
    ing: 106.8299,
    role: 'User',
    smallCollectionPointId: 0,
  },
  {
    userId: 'e9b4b9de-b3b0-49ad-b90c-74c24a26b57a',
    name: 'Nguyễn Minh Khôi',
    email: 'nguyen.minh.khoi@example.com',
    phone: '0908123456',
    address: 'Trường THCS Long Thạnh Mỹ – Đường Long Thạnh Mỹ, TP. Thủ Đức',
    avatar: 'https://picsum.photos/id/1033/200/200',
    iat: 10.8459,
    ing: 106.8334,
    role: 'User',
    smallCollectionPointId: 0,
  },
  {
    userId: '72b4ad6a-0b5b-45a3-bb6b-6e1790c84b45',
    name: 'Phạm Thị Hằng',
    email: 'pham.thi.hang@example.com',
    phone: '0911222333',
    address: 'UBND Phường Long Thạnh Mỹ – 86 Nguyễn Xiển, TP. Thủ Đức',
    avatar: 'https://picsum.photos/id/1045/200/200',
    iat: 10.841,
    ing: 106.83,
    role: 'User',
    smallCollectionPointId: 0,
  },
  {
    userId: 'c40deff9-163b-49e8-b967-238f22882b63',
    name: 'Đỗ Quốc Bảo',
    email: 'do.quoc.bao@example.com',
    phone: '0977222333',
    address: 'Công viên Ánh Sáng Vinhomes – Khu đô thị Vinhomes Grand Park',
    avatar: 'https://picsum.photos/id/1059/200/200',
    iat: 10.839,
    ing: 106.8338,
    role: 'User',
    smallCollectionPointId: 0,
  },
  // Add the requested collector account (delivery)
  {
    collectorId: '6df4af85-6a59-4a0a-8513-1d7859fbd789',
    userId: '6df4af85-6a59-4a0a-8513-1d7859fbd789',
    name: 'Ngô Văn Dũng',
    email: 'ngo.van.dung@ewc.vn',
    phone: '0905999888',
    avatar: 'https://picsum.photos/id/1062/200/200',
    smallColltionId: 1,
    role: 'delivery',
  },
  {
    collectorId: 'c011ec70-b861-468f-b648-812e90f01a7e',
    userId: 'c011ec70-b861-468f-b648-812e90f01a7e',
    name: 'Lê Minh Tuấn',
    email: 'le.minh.tuan@ewc.vn',
    phone: '0905111222',
    avatar: 'https://picsum.photos/id/1063/200/200',
    smallColltionId: 1,
    role: 'delivery',
  },
];

export const registerMock = createAsyncThunk(
  'auth/registerMock',
  async (payload: {
    email: string;
    password: string;
    phone?: string;
    username?: string;
  }) => {
    const { email } = payload;
    await new Promise<void>(resolve => setTimeout(resolve, 600));

    if (email.includes('delivery')) {
      return { user: { email }, role: 'delivery' as const };
    }

    return { user: { email }, role: 'user' as const };
  },
);

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

    // If there is no pending verified registration, try mock user store
    const { identifier, password } = payload;

    // allow login by email, phone, or userId against the small mockUsers list
    const matched = mockUsers.find(
      u =>
        u.email === identifier ||
        u.phone === identifier ||
        u.userId === identifier,
    );
    if (matched) {
      // For the mock users accept a simple password: '123456'
      if (password === '123456') {
        // prefer the role declared on the mock user (fallback to 'user') and normalize to lowercase
        const rawRole = (matched as any).role || 'user';
        const role =
          String(rawRole).toLowerCase() === 'delivery' ? 'delivery' : 'user';
        return {
          user: {
            email: matched.email,
            name: matched.name,
            userId: matched.userId,
            phone: matched.phone,
            address: matched.address,
            avatar: matched.avatar,
          },
          role: role,
        };
      }
      return rejectWithValue('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    return rejectWithValue('Tài khoản chưa được xác thực hoặc không tồn tại');
  },
);

// Google Sign-In with Firebase
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      await auth().signOut();

      await GoogleSignin.signOut();
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      const user = signInResult.data?.user;

      if (!idToken || !user) {
        return rejectWithValue('Không thể lấy thông tin từ Google');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      const firebaseToken = await userCredential.user.getIdToken();
      const apiResp = await authService.getTokenByLoginGoogle(firebaseToken);

      return {
        user: {
          userId: '7f5c8b33-1b52-4d11-91b0-932c3d243c71',
          name: 'Trần Huỳnh Bảo Ngọc',
          email: 'ngocthbse183850@fpt.edu.vn',
          phone: '0901234567',
          address:
            'Vinhomes Grand Park – Nguyễn Xiển, Phường Long Thạnh Mỹ, TP. Thủ Đức',
          avatar: 'https://picsum.photos/id/1011/200/200',
          iat: 10.842003,
          ing: 106.82958,
        },
        role: 'user' as const,
      };
    } catch (error: any) {
      console.error('[GoogleLogin] Error:', error);

      if (error.code === 'ERR_CANCELED') {
        return rejectWithValue('Đăng nhập Google đã bị hủy');
      }

      return rejectWithValue('Đăng nhập Google thất bại. Vui lòng thử lại.');
    }
  },
);

// Hydrate auth state from AsyncStorage (call once on app startup)
export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  try {
    const raw = await AsyncStorage.getItem('auth');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.role = null;
      state.error = null;
      state.pendingRegistration = null;
      // remove persisted auth
      try {
        AsyncStorage.removeItem('auth');
      } catch (e) {
        // ignore
      }
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
      // persist updated auth to AsyncStorage
      try {
        AsyncStorage.setItem(
          'auth',
          JSON.stringify({ user: state.user, role: state.role }),
        );
      } catch (e) {
        // ignore storage errors
      }
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

    // hydrate handlers
    builder.addCase(hydrateAuth.fulfilled, (state, action) => {
      if (action.payload) {
        state.user = action.payload.user || null;
        state.role = action.payload.role
          ? String(action.payload.role).toLowerCase() === 'delivery'
            ? 'delivery'
            : 'user'
          : null;
      }
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
        // persist auth to AsyncStorage for session restore
        try {
          AsyncStorage.setItem(
            'auth',
            JSON.stringify({
              user: action.payload.user,
              role: action.payload.role,
            }),
          );
        } catch (e) {
          // ignore storage errors
        }
      },
    );
    builder.addCase(loginMock.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) || action.error.message || 'Lỗi đăng nhập';
    });

    // loginWithGoogle handlers
    builder.addCase(loginWithGoogle.pending, state => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      loginWithGoogle.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.role = action.payload.role;
        state.error = null;
        state.pendingRegistration = null;

        // Persist auth to AsyncStorage
        try {
          AsyncStorage.setItem(
            'auth',
            JSON.stringify({
              user: action.payload.user,
              role: action.payload.role,
            }),
          );
        } catch (e) {
          console.warn('Failed to persist Google auth to AsyncStorage', e);
        }
      },
    );
    builder.addCase(loginWithGoogle.rejected, (state, action) => {
      state.loading = false;
      state.error =
        (action.payload as string) ||
        action.error.message ||
        'Lỗi đăng nhập Google';
    });
  },
});

export const {
  logout,
  setPendingRegistration,
  verifyPendingRegistration,
  clearPendingRegistration,
  setError,
  setUser,
  setRole,
} = authSlice.actions;

export default authSlice.reducer;
