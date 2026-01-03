// src/config/googleSignInConfig.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Config from './env';
import { Platform } from 'react-native';

GoogleSignin.configure({
  webClientId: Config.GOOGLE_LOGIN || '',
  iosClientId: Platform.OS === 'ios' ? Config.GOOGLE_IOS_CLIENT_ID : '',
  offlineAccess: true,
});

export default GoogleSignin;
