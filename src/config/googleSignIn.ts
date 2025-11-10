import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from './env';
// Configure Google Sign-In
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId: Config.GOOGLE_LOGIN,
    offlineAccess: true,
    forceCodeForRefreshToken: true,
  });
};

export default configureGoogleSignIn;
