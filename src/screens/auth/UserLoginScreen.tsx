import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Platform } from 'react-native';

import { setUser, setLoading } from '../../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import {
  signInWithGoogle,
  fetchUserProfile,
  signInWithApple,
} from '../../services/authService';
import AppButton from '../../components/ui/AppButton';

const simpleLogin = require('../../assets/images/simplelogin.png');
const google = require('../../assets/images/google.jpg');
const logo = require('../../assets/images/logo.png');
export default function UserLoginScreen() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
const [loadingApple , setLoadingApple] = useState(false);
  const navigation = useNavigation<any>();
  const isIOS = Platform.OS === 'ios';

  const handleGoogleLogin = async () => {
    try {
      dispatch(setLoading(true));
      await signInWithGoogle();

      const profileData: any = await fetchUserProfile();
      dispatch(setUser(profileData));

      // @ts-ignore
      globalThis.navigation?.replace('MainTabs');

      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công!',
        text2: 'Chào mừng bạn đến với ứng dụng',
      });
    } catch (error: any) {
      console.log('Google login error', error);
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleAppleLogin = async () => {
    try {
      setLoadingApple(true);
console.log('Starting Apple login');
      // 1. Apple native popup
      const appleResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });
console.log('Apple response received', appleResponse);

      if (!appleResponse.identityToken) {
        throw new Error('No identityToken');
      }

      // 2. Gửi token lên backend
      await signInWithApple({
        identityToken: appleResponse.identityToken,
        firstName: appleResponse.fullName?.givenName || null,
        lastName: appleResponse.fullName?.familyName || null,
      });

      // 3. Lấy profile
      const profileData: any = await fetchUserProfile();
      dispatch(setUser(profileData));

      // @ts-ignore
      globalThis.navigation?.replace('MainTabs');

      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công!',
      });
    } catch (error) {
      console.log('Apple login error', error);
    } finally {
     setLoadingApple(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        {/* TOP 70% */}
        <View className="flex-1 items-center justify-center px-6">
          <Image
            source={logo}
            className="w-24 h-24 mb-12"
            resizeMode="contain"
          />

          {/* Banner lớn */}
          <Image
            source={simpleLogin}
            className="w-72 h-72"
            resizeMode="contain"
          />

          <Text className="text-3xl font-bold text-gray-800">
            Chào mừng <Text className="text-primary-100">bạn</Text>
          </Text>

          <Text className="text-gray-500 text-sm mt-1">
            Tham gia cùng chúng tôi ngay hôm nay!
          </Text>
        </View>

        {/* BOTTOM 30% */}
        <View
          className=" bg-primary-100 px-8 py-10 mt-2"
          style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40 }}
        >
          {/* GOOGLE LOGIN BUTTON */}
          <View className="py-4 ">
            {/* APPLE LOGIN BUTTON (iOS only, no simulator) */}
            {isIOS && (
  <View className="mb-6">
    <View style={{ position: 'relative' }}>
     

      {loadingApple ? (
       <AppButton 
        title=""
        disabled={true }
       color='#000'
       loading={true}
       />

      ):( <AppleButton
        buttonType={AppleButton.Type.SIGN_IN}
        buttonStyle={AppleButton.Style.BLACK}
        style={{
          width: '100%',
          height: 44,
          borderRadius: 60
        }}
        onPress={handleAppleLogin}
    
      />)}
    </View>
  </View>
)}


            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={auth.isLoading || loadingApple}
              className={`flex-row items-center justify-center  py-4 bg-white rounded-2xl shadow-lg mb-4 ${
                auth.isLoading && 'opacity-60'
              }`}
            >
              {auth.isLoading ? (
                <ActivityIndicator color="#e85a4f" />
              ) : (
                <>
                  <Image source={google} className="w-5 h-5 mr-3" />
                  <Text className="text-primary-100 font-semibold text-base">
                    Đăng nhập với Google
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6 ">
              <Text className="text-gray-700 text-base">
                Là người thu gom?{' '}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('DeliveryLogin')}
              >
                <Text className="text-white font-bold text-base">
                  Đăng nhập
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
