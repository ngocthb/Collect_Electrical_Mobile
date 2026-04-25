import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import toast from 'react-native-toast-message';
import Config from './env';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

// =======================
// AXIOS INSTANCE
// =======================
const axiosClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosRefresh = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
});

// =======================
// TOKEN HELPERS
// =======================
const getAccessToken = () => AsyncStorage.getItem('token');
const getRefreshToken = () => AsyncStorage.getItem('refreshToken');

const saveTokens = async (accessToken: string, refreshToken: string) => {
  await AsyncStorage.setItem('token', accessToken);
  await AsyncStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = async () => {
  await AsyncStorage.multiRemove(['token', 'refreshToken']);
};

// =======================
// REFRESH QUEUE
// =======================
let isRefreshing = false;

let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(p => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token as string);
    }
  });
  failedQueue = [];
};

// =======================
// REQUEST INTERCEPTOR
// =======================
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  error => Promise.reject(error),
);

// =======================
// RESPONSE INTERCEPTOR
// =======================
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<any>) => {
    const originalRequest: any = error.config;

    const status = error.response?.status;
    const message = error.response?.data?.message;

    // =======================
    // HANDLE 401
    // =======================
    if (status === 401) {
      // =======================
      // ❗ CASE 1: FORCE LOGOUT
      // =======================
      if (message) {
        console.log('🚨 FORCE LOGOUT:', message);

        await clearTokens();
        delete axiosClient.defaults.headers.common.Authorization;

        processQueue(error, null);

        store.dispatch(logout());

        toast.show({
          type: 'error',
          text1: message,
        });

        return Promise.reject({
          type: 'FORCE_LOGOUT',
          message,
        });
      }

      // =======================
      // 🔄 CASE 2: TOKEN EXPIRED → REFRESH
      // =======================
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('🔄 REFRESH TOKEN');

          const accessToken = await getAccessToken();
          const refreshToken = await getRefreshToken();

          if (!accessToken || !refreshToken) {
            throw new Error('Missing token');
          }

          const res: any = await axiosRefresh.post('/auth/refresh-token', {
            accessToken,
            refreshToken,
          });

          const newAccessToken = res?.data?.accessToken;
          const newRefreshToken = res?.data?.refreshToken;

          if (!newAccessToken) {
            throw new Error('No new access token');
          }

          await saveTokens(newAccessToken, newRefreshToken);

          axiosClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosClient(originalRequest);
        } catch (err) {
          console.log('❌ REFRESH FAIL');

          processQueue(err, null);

          await clearTokens();
          store.dispatch(logout());

          return Promise.reject({
            type: 'REFRESH_FAILED',
          });
        } finally {
          isRefreshing = false;
        }
      }
    }

    // =======================
    // HANDLE 403
    // =======================
    if (status === 403) {
      toast.show({
        type: 'error',
        text1: 'Bạn không có quyền thực hiện hành động này.',
      });
    }

    // =======================
    // OTHER ERRORS
    // =======================
    return Promise.reject(
      error.response?.data || {
        message: error.message,
      },
    );
  },
);

export default axiosClient;
