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

// 👉 Tạo instance chính
const axiosClient = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 👉 Instance riêng cho refresh (tránh loop)
const axiosRefresh = axios.create({
  baseURL: Config.API_URL,
  timeout: 10000,
});

// 👉 State xử lý queue
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// =======================
// REQUEST INTERCEPTOR
// =======================
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
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

    // =======================
    // HANDLE 401
    // =======================
    if (error.response?.status === 401 && !originalRequest._retry) {
      const originalRequest: any = error.config;
      console.log(error.response);
      const message = error.response?.data?.message;

      console.log(message);
      if (message) {
        console.log('🚨 FORCE LOGOUT');

        await AsyncStorage.clear();
        delete axiosClient.defaults.headers.common.Authorization;
        store.dispatch(logout());

        toast.show({
          type: 'error',
          text1: message,
        });

        return Promise.reject(error);
      }

      // 👉 CASE 2: token hết hạn bình thường → refresh
      if (!originalRequest._retry) {
        if (isRefreshing) {
          // 👉 Đợi token mới
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axiosClient(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('========== REFRESH TOKEN ==========');

          const refreshToken = await AsyncStorage.getItem('refreshToken');
          const accessToken = await AsyncStorage.getItem('token');
          console.log(refreshToken, accessToken);
          const res: any = await axiosRefresh.post('/auth/refresh-token', {
            refreshToken,
            accessToken,
          });

          const newToken = res?.data?.accessToken;
          const newRefreshToken = res?.data?.refreshToken;
          console.log(newToken);
          if (!newToken) throw new Error('No access token returned');

          // 👉 lưu token mới
          await AsyncStorage.setItem('token', newToken);

          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          // 👉 set header mặc định
          axiosClient.defaults.headers.common[
            'Authorization'
          ] = `Bearer ${newToken}`;

          // 👉 xử lý queue
          processQueue(null, newToken);

          // 👉 retry request cũ
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosClient(originalRequest);
        } catch (err) {
          processQueue(err, null);

          // 👉 logout nếu refresh fail
          // await AsyncStorage.multiRemove(['token', 'refreshToken']);

          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    // =======================
    // HANDLE 403
    // =======================
    if (error.response?.status === 403) {
      toast.show({
        type: 'error',
        text1: 'Bạn không có quyền thực hiện hành động này.',
      });
    }

    // =======================
    // HANDLE OTHER ERRORS
    // =======================
    console.log('API ERROR:', error.response?.data);

    return Promise.reject(
      error.response?.data?.message || error.response?.data || error.message,
    );
  },
);

export default axiosClient;
