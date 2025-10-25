import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loginMock, setError } from '../../store/authSlice';
import SubLayout from '../../layout/SubLayout';

const login = require('../../assets/images/login.png');
const google = require('../../assets/images/google.jpg');
export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();

  const handleLogin = () => {
    dispatch(loginMock({ identifier: email, password }));
  };

  useEffect(() => {
    if (auth.user && auth.role) {
      if (auth.role === 'user') {
        // @ts-ignore
        globalThis.navigation?.replace('MainTabs');
      } else if (auth.role === 'delivery') {
        // @ts-ignore
        globalThis.navigation?.replace('Dashboard');
      }
    }
  }, [auth.user, auth.role]);

  useFocusEffect(
    useCallback(() => {
      // clear any previous auth error when screen becomes active
      dispatch(setError(null));
      return () => {
        // also clear on blur if needed
        dispatch(setError(null));
      };
    }, [dispatch]),
  );
  return (
    <SubLayout title="" onBackPress={() => navigation.goBack()}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View className="flex-1 bg-white px-6 items-center justify-center">
          {/* Logo */}
          <View className="w-28 h-28 items-center justify-center mb-8">
            <Image source={login} className="w-24 h-24" resizeMode="contain" />
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
            <TouchableOpacity>
              <Text className="text-text-muted text-xs">Quên mật khẩu?</Text>
            </TouchableOpacity>
          </View>
          {auth.error ? (
            <Text className="text-red-500 mt-3 text-center mb-4">
              {auth.error}
            </Text>
          ) : null}
          <AppButton
            title="Đăng nhập"
            onPress={handleLogin}
            loading={auth.loading}
            disabled={auth.loading || !email || !password}
          />

          <View className="flex-row items-center mt-4 w-full">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="px-2 text-sm text-text-muted">hoặc</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Google Sign-In Button */}
          <View className="mt-4">
            <TouchableOpacity
              onPress={() => {}}
              className="items-center py-4 px-8 justify-center bg-white rounded-lg shadow-lg "
            >
              <Image
                source={google} // đường dẫn icon Google
                className="w-6 h-6"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Register link */}
          <View className="flex-row justify-center mt-6">
            <Text className="text-base font-normal text-text-muted">
              Chưa có tài khoản?
            </Text>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('Register');
              }}
            >
              <Text className="text-secondary-100 text-base font-bold ml-2 ">
                Đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SubLayout>
  );
}
