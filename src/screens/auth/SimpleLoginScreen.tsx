import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginMock, setError, setLoading } from '../../store/authSlice';
import Toast from 'react-native-toast-message';
import { signInWithGoogle } from '../../services/authService';

const simpleLogin = require('../../assets/images/simplelogin.png');
const google = require('../../assets/images/google.jpg');

export default function SimpleLoginScreen() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  const navigation = useNavigation<any>();

  const handleGoogleLogin = async () => {
    try {
      dispatch(setLoading(true));
      await signInWithGoogle();
      await dispatch(
        loginMock({
          identifier: 'ngocthbse183850@fpt.edu.vn',
          password: '123456',
        }),
      ).unwrap();

      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công!',
        text2: 'Chào mừng bạn đến với ứng dụng',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: error || 'Vui lòng thử lại',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (auth.user && auth.role) {
      Toast.show({
        type: 'success',
        text1: 'Đăng nhập thành công!',
        text2: `Chào mừng ${auth.user.name || auth.user.email}`,
      });

      if (auth.role === 'user') {
        navigation?.replace('MainTabs');
      } else {
        navigation?.replace('Dashboard');
      }
    }
  }, [auth.user, auth.role]);

  useFocusEffect(
    useCallback(() => {
      dispatch(setError(null));
      return () => dispatch(setError(null));
    }, [dispatch]),
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-white">
        {/* TOP SECTION */}
        <View className="items-center justify-center mt-16 flex-1">
          <Image
            source={simpleLogin}
            className="w-52 mb-6"
            resizeMode="contain"
          />

          <Text className="text-3xl font-bold text-gray-800 mb-2">
            Chào mừng <Text className="text-primary-100">bạn</Text>
          </Text>

          <Text className="text-gray-500 text-sm font-medium">
            Tham gia với chúng tôi ngay
          </Text>
        </View>

        {/* BOTTOM CARD */}
        <View className="bg-primary-100 rounded-t-3xl px-8 pt-12 pb-10">
          {/* GOOGLE LOGIN BUTTON */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            disabled={auth.loading}
            className={`flex-row items-center justify-center py-4 bg-white rounded-xl shadow-md ${
              auth.loading ? 'opacity-60' : ''
            }`}
          >
            {auth.loading ? (
              <ActivityIndicator color="#4169E1" />
            ) : (
              <>
                <Image source={google} className="w-5 h-5 mr-3" />
                <Text className="text-primary-100 font-semibold text-base">
                  Đăng nhập với Google
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Register */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-white text-base">Là người thu gom? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-secondary-100 font-bold text-base">
                Đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
