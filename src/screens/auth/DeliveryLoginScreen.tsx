import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setError, setLoading, setUser } from '../../store/slices/authSlice';
import Toast from 'react-native-toast-message';
import { fetchUserProfile } from '../../services/authService';
import { signIn } from '../../services/authService';
import type { DeliveryLoginResponse } from '../../types/Profile';
const logo = require('../../assets/images/logo.png');

export default function DeliveryLoginScreen() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    try {
      dispatch(setLoading(true));

      const data: DeliveryLoginResponse = await signIn(email, password);
      if (data.isFirstLogin) {
        Toast.show({
          type: 'info',
          text1: 'Đăng nhập thành công',
          text2: 'Vui lòng đổi mật khẩu để bảo mật tài khoản',
        });
        navigation.navigate('ForgotPass', { type: 'verify_account', email });
        return;
      }
      const userProfile: any = await fetchUserProfile();
      dispatch(setUser(userProfile));

      if (userProfile.role === 'Collector') {
        // @ts-ignore
        globalThis.navigation?.replace('Dashboard');

        Toast.show({
          type: 'success',
          text1: 'Đăng nhập thành công!',
          text2: `Chào mừng ${userProfile.name || userProfile.email}`,
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Đăng nhập thất bại',
        text2: 'Tên đăng nhập hoặc mật khẩu không đúng',
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white px-6 items-center justify-center">
        {/* Logo */}
        <View className="w-28 h-28 items-center justify-center mb-8">
          <Image source={logo} className="w-24 h-24" resizeMode="contain" />
        </View>

        {/* Welcome text */}
        <Text className="text-center text-2xl font-bold text-text-main mb-2">
          Chào mừng <Text className="text-primary-100">trở lại!</Text>
        </Text>
        <Text className="text-center text-sm text-text-muted mb-8">
          Tham gia với chúng tôi ngay
        </Text>

        {/* Input fields */}
        <View style={{ width: '100%', gap: 16 }}>
          <AppInput
            ref={emailRef}
            label="Tên đăng nhập hoặc email"
            placeholder="Nhập tên đăng nhập hoặc email"
            value={email}
            onChangeText={t => {
              setEmail(t);
              dispatch(setError(null));
            }}
            required
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <AppInput
            ref={passwordRef}
            label="Mật khẩu"
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={t => {
              setPassword(t);
              dispatch(setError(null));
            }}
            secureTextEntry
            required
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
        </View>

        {/* Forgot password */}
        <View className="w-full mt-2 items-end mb-4">
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ForgotPass', { type: 'forgot_password' })
            }
          >
            <Text className="text-text-muted text-xs">Quên mật khẩu?</Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="Đăng nhập"
          onPress={handleLogin}
          loading={auth.isLoading}
          disabled={auth.isLoading || !email || !password}
        />

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-base font-normal text-text-muted">
            Bạn là khách hàng ?
          </Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('UserLogin');
            }}
          >
            <Text className="text-primary-100 text-base font-bold ml-2 ">
              Đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
