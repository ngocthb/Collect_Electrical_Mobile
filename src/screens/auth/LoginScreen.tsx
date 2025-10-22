import React, { useState, useContext } from 'react';
import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { AuthContext } from '../../context/AuthContext';

const login = require('../../assets/images/login.png');
const google = require('../../assets/images/google.jpg');
export default function LoginScreen() {
  const { setUser, setRole } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (
      (email === 'user' || email === 'user@gmail.com') &&
      password === '123'
    ) {
      setUser({ email });
      setRole('user');
      // @ts-ignore
      globalThis.navigation?.replace('MainTabs');
    } else if (
      (email === 'delivery' || email === 'delivery@gmail.com') &&
      password === '123'
    ) {
      setUser({ email });
      setRole('delivery');
      // @ts-ignore
      globalThis.navigation?.replace('Dashboard');
    } else {
      Alert.alert('Sai thông tin', 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };
  return (
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
          label="Tên đăng nhập hoặc email"
          placeholder="Nhập tên đăng nhập hoặc email"
          value={email}
          onChangeText={setEmail}
          required
        />

        <AppInput
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          required
        />
      </View>

      {/* Forgot password */}
      <View className="w-full mt-2 items-end mb-4">
        <TouchableOpacity>
          <Text className="text-text-muted text-xs">Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <AppButton title="Đăng nhập" onPress={handleLogin} />

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
        <TouchableOpacity>
          <Text className="text-secondary-100 text-base font-bold ml-2 ">
            Đăng ký
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
