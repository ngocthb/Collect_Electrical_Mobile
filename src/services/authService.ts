import axiosClient from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleSignin from '../config/googleSignIn';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import { Profile, DeliveryLoginResponse } from '../types/Profile';
import { Platform, PermissionsAndroid } from 'react-native';

export const requestNotificationPermission = async (): Promise<void> => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );

    console.log('🔔 Notification permission:', granted);
  } else {
    console.log('🔔 Notification permission: Not required on this platform');
  }
};

// export const registerFcmToken = async (
//   userId: String,
// ): Promise<string | null> => {
//   try {
//     await requestNotificationPermission();
//     await messaging().requestPermission();
//     const fcmToken = await messaging().getToken();
//     const platform = Platform.OS;
//     console.log('FCM token', fcmToken);
//     const response = await axiosClient.post('/notifications/register-device', {
//       fcmToken,
//       platform,
//       userId,
//     });
//     console.log(response);
//     return fcmToken;
//   } catch (error) {
//     console.error('❌ Lỗi lấy FCM token:', error);
//     return null;
//   }
// };

export const registerFcmToken = async (
  userId: string,
  voipToken: string,
): Promise<string | null> => {
  try {
    // 🔹 ANDROID 13+
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      console.log('🔔 Android permission:', granted);
    }

    // 🔹 iOS permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('❌ Notification permission denied');
      return null;
    }

    // 🔥 QUAN TRỌNG CHO iOS
    if (Platform.OS === 'ios') {
      await messaging().registerDeviceForRemoteMessages();
    }

    // 🔹 Lấy FCM token
    const fcmToken = await messaging().getToken();
    console.log('📱 FCM token:', fcmToken);
    console.log('voip ', voipToken);
    await axiosClient.post('/notifications/register-device', {
      voipToken,
      fcmToken,
      platform: Platform.OS,
      userId,
    });

    return fcmToken;
  } catch (error) {
    console.error('❌ Lỗi lấy FCM token:', error);
    return null;
  }
};

export const signInWithGoogle = async (): Promise<any> => {
  try {
    console.log('🚀 [1] Bắt đầu Google Sign In');

    if (Platform.OS === 'android') {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    console.log('🚀 [2] Sign out để clean state');
    await GoogleSignin.signOut();

    console.log('🚀 [3] Mở Google Sign In UI');
    const userInfo = await GoogleSignin.signIn();

    console.log('🚀 [4] UserInfo:', JSON.stringify(userInfo, null, 2));

    // Handle cancelled
    if (userInfo.type === 'cancelled') {
      throw new Error('User cancelled the sign in');
    }

    const idToken = userInfo.data?.idToken;

    if (!idToken) {
      console.error('❌ Không có idToken');
      throw new Error('Không thể lấy ID token từ Google');
    }

    console.log('🚀 [5] ID Token OK');

    // Tạo credential
    const credential = auth.GoogleAuthProvider.credential(idToken);
    console.log('🚀 [6] Credential created');

    console.log('🚀 [7] Đăng nhập Firebase...');
    // Gọi trực tiếp auth() - nó sẽ tự động init
    const userCredential = await auth().signInWithCredential(credential);

    if (!userCredential.user) {
      throw new Error('Đăng nhập Firebase thất bại');
    }

    console.log('🚀 [8] Firebase User:', userCredential.user.uid);

    const firebaseIdToken = await userCredential.user.getIdToken();
    console.log('🚀 [9] Firebase ID Token OK');

    console.log('🚀 [10] Gọi API backend...');
    const response = await getTokenByLoginGoogle(firebaseIdToken);
    console.log('response', response);
    const _res: any = response;
    const token = _res.token.accessToken;
    const refreshToken = _res.token.refreshToken;

    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      console.log('🚀 [11] Token saved');
    }

    return response;
  } catch (error: any) {
    console.error('❌ Error:', error);
    console.error('❌ Code:', error?.code);
    console.error('❌ Message:', error?.message);
    throw error;
  }
};
export const signIn = async (
  username: string,
  password: string,
): Promise<DeliveryLoginResponse> => {
  try {
    const res = (await axiosClient.post('/auth/login', {
      username,
      password,
    })) as any;
    console.log(res);
    const token: string = res.accessToken;
    const refreshToken: string = res.refreshToken;
    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken);

      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  } catch (error) {
    console.error('[signIn] Error:', error);
    throw error;
  }
};

export const signInWithApple = async (appleData: {
  identityToken: string;
  firstName: string | null;
  lastName: string | null;
}): Promise<any> => {
  try {
    console.log('Signing in with Apple data:', appleData);
    const res = await (axiosClient.post('/auth/login-apple', {
      identityToken: appleData.identityToken,
      firstName: appleData.firstName,
      lastName: appleData.lastName,
    }) as any);

    const token: any = res?.token?.accessToken;
    if (token) {
      await AsyncStorage.setItem('token', token);
      console.log('Apple sign-in token saved:', token);
      axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
    }
    return res;
  } catch (error) {
    console.error('[signInWithApple] Error:', error);
    throw error;
  }
};
// Hàm đăng xuất
export const signOutGoogle = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch (error) {
    console.error('[signOutGoogle] Error:', error);
    throw error;
  }
};

// Sign out: remove token from storage and clear axios header, then sign out from firebase/google
export const signOut = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('token');
  } catch (error) {
    console.error('[signOut] Error:', error);
    throw error;
  }
};

const getTokenByLoginGoogle = async (token: string) => {
  try {
    console.log(token);
    const res = await axiosClient.post('/auth/login-google', { token: token });
    console.log(res);
    return res;
  } catch (e) {
    throw e;
  }
};

// Fetch user profile from backend
export const fetchUserProfile = async (): Promise<any> => {
  try {
    const response = await axiosClient.get<Profile>('/users/profile');

    return response;
  } catch (error) {
    console.error('[fetchUserProfile] Error:', error);
    throw error;
  }
};

export const getOtpByEmail = async (email: string): Promise<any> => {
  try {
    const response = await axiosClient.post('/forgot-password/save-otp', {
      email,
    });
    return response;
  } catch (error) {
    console.error('[getOtpByEmail] Error:', error);
    throw error;
  }
};

export const verifyOtp = async (email: string, otp: string): Promise<any> => {
  try {
    const response = await axiosClient.post('/forgot-password/check-otp', {
      email,
      otp,
    });
    return response;
  } catch (error) {
    console.error('[verifyOtp] Error:', error);
    throw error;
  }
};

export const changePassword = async (
  email: string,
  newPassword: string,
  confirmNewPassword: string,
): Promise<any> => {
  try {
    console.log(email, newPassword, confirmNewPassword);
    const response = await axiosClient.post('/forgot-password/re-pass', {
      email,
      newPassword,
      confirmNewPassword,
    });
    return response;
  } catch (error) {
    console.error('[changePassword] Error:', error);
    throw error;
  }
};

export const bootstrapAuth = async (): Promise<{
  success: boolean;
  profile?: Profile;
  role?: string;
}> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return { success: false };
    }

    const profileData: Profile = await fetchUserProfile();

    const roleVal = (profileData?.role || '').toString().toLowerCase();
    const role = roleVal === 'delivery' ? 'delivery' : 'user';

    return { success: true, profile: profileData, role };
  } catch (error) {
    await AsyncStorage.removeItem('token');
    console.error('[bootstrapAuth] Error:', error);
    return { success: false };
  }
};
export default {
  signInWithGoogle,
  signOutGoogle,
  getTokenByLoginGoogle,
  fetchUserProfile,
  signOut,
  signInWithApple,
  bootstrapAuth,
};
