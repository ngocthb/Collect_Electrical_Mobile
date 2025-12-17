import axiosClient from '../config/axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleSignin from '../config/googleSignIn';
import auth from '@react-native-firebase/auth';
import { Profile, DeliveryLoginResponse } from '../types/Profile';

export const signInWithGoogle = async (): Promise<any> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut();
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error('Không thể lấy ID token từ Google');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(
      userInfo.data.idToken,
    );
    const userCredential = await auth().signInWithCredential(googleCredential);

    if (!userCredential.user) {
      throw new Error('Đăng nhập Firebase thất bại');
    }

    // 4. Lấy Firebase ID Token
    const firebaseIdToken = await userCredential.user.getIdToken();

    const response = await getTokenByLoginGoogle(firebaseIdToken);

    // Try to find the token in common fields and persist it to AsyncStorage
    const _res: any = response;
    const token = _res?.token || _res?.accessToken || _res?.data?.token || null;

    if (token) {
      await AsyncStorage.setItem('token', token);

      try {
        axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (e) {}
    }

    return response;
  } catch (error) {
    console.error('[signInWithGoogle] Error:', error);
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
    const token: string = res.accessToken;
    if (token) {
      await AsyncStorage.setItem('token', token);

      try {
        axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
      } catch (e) {}
    }
    return res;
  } catch (error) {
    console.error('[signIn] Error:', error);
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
    const res = await axiosClient.post('/auth/login-google', { token: token });
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

// Bootstrap auth: check token in AsyncStorage and fetch profile if exists
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
    return { success: false };
  }
};

export default {
  signInWithGoogle,
  signOutGoogle,
  getTokenByLoginGoogle,
  fetchUserProfile,
  bootstrapAuth,
  signOut,
};
