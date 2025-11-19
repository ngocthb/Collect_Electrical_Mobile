// src/config/googleSignInConfig.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from './env';

GoogleSignin.configure({
  webClientId: Config.GOOGLE_LOGIN || '',
  offlineAccess: true,
});

export default GoogleSignin;
