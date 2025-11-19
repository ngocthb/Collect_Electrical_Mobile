import axiosClient from '../config/axios';
import GoogleSignin from '../config/googleSignIn';
import auth from '@react-native-firebase/auth';

interface GoogleUser {
  id: string;
  email: string;
  name: string | null;
  givenName: string | null;
  familyName: string | null;
  photo: string | null;
}

interface GoogleSignInData {
  idToken: string;
  serverAuthCode: string | null;
  scopes: string[];
  user: GoogleUser;
}

export const signInWithGoogle = async (): Promise<any> => {
  try {
    // 1. Kiểm tra Google Play Services
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await GoogleSignin.signOut(); // Đảm bảo đăng xuất trước khi đăng nhập lại
    // 2. Đăng nhập Google
    const userInfo = await GoogleSignin.signIn();

    if (!userInfo.data?.idToken) {
      throw new Error('Không thể lấy ID token từ Google');
    }

    // 3. Đăng nhập Firebase với Google credential
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

    return response;
  } catch (error) {
    console.error('[signInWithGoogle] Error:', error);
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

const getTokenByLoginGoogle = async (token: string) => {
  try {
    console.log(token);
    const res = await axiosClient.post('/auth/login-google', { token: token });
    return res;
  } catch (e) {
    throw e;
  }
};

export default { signInWithGoogle, signOutGoogle, getTokenByLoginGoogle };
