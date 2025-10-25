import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setPendingRegistration } from '../../store/authSlice';
import SubLayout from '../../layout/SubLayout';
const register = require('../../assets/images/logo.png');

export default function RegisterScreen() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<any>();
  const usernameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const scrollViewRef = useRef<ScrollView | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateEmail = (e: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(e);
  };

  const validatePhone = (p: string) => {
    const digits = p.replace(/[^0-9]/g, '');
    return /^\d{9,15}$/.test(digits);
  };

  const validatePassword = (pw: string) => {
    return pw.length > 5; // password must be greater than 6 characters
  };

  const handleRegister = () => {
    // run validations
    let ok = true;
    setUsernameError(null);
    setEmailError(null);
    setPhoneError(null);
    setPasswordError(null);

    if (!username.trim()) {
      setUsernameError('Vui lòng nhập tên đăng nhập');
      ok = false;
    }
    if (!validateEmail(email)) {
      setEmailError('Email không hợp lệ');
      ok = false;
    }
    if (!validatePhone(phone)) {
      setPhoneError('Số điện thoại không hợp lệ');
      ok = false;
    }
    if (!validatePassword(password)) {
      setPasswordError('Mật khẩu phải nhiều hơn 6 ký tự');
      ok = false;
    }

    if (!ok) {
      // focus first invalid
      if (usernameError) usernameRef.current?.focus();
      else if (emailError) emailRef.current?.focus();
      else if (phoneError) phoneRef.current?.focus();
      else if (passwordError) passwordRef.current?.focus();
      return;
    }

    // store pending registration and go to Verify
    dispatch(setPendingRegistration({ username, email, phone, password }));
    navigation.navigate('Verify');
  };

  // registration no longer auto-navigates here; flow goes through Verify -> Login
  return (
    <SubLayout title="" onBackPress={() => navigation.goBack()}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-1 bg-white px-6 items-center justify-center py-8">
              {/* Logo */}
              <View className="w-28 h-28 items-center justify-center mb-8">
                <Image
                  source={register}
                  className="w-24 h-24"
                  resizeMode="contain"
                />
              </View>

              {/* Welcome text */}
              <Text className="text-center text-2xl font-bold text-text-main mb-2">
                Tham gia <Text className="text-primary-100">ngay!</Text>
              </Text>
              <Text className="text-center text-sm text-text-muted mb-8">
                Bắt đầu bằng cách tạo tài khoản
              </Text>

              {/* Input fields */}
              <View style={{ width: '100%', gap: 16 }} className="mb-4">
                <AppInput
                  ref={usernameRef}
                  label="Tên đăng nhập"
                  placeholder="Nhập tên đăng nhập "
                  value={username}
                  onChangeText={t => {
                    setUsername(t);
                    setUsernameError(null);
                  }}
                  error={usernameError ?? undefined}
                  required
                  returnKeyType="next"
                  onSubmitEditing={() => emailRef.current?.focus()}
                  onFocus={() => {
                    // Scroll to top when focusing first input
                    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
                  }}
                />
                <AppInput
                  ref={emailRef}
                  label="Địa chỉ email"
                  placeholder="Nhập địa chỉ email"
                  value={email}
                  onChangeText={t => {
                    setEmail(t);
                    setEmailError(null);
                  }}
                  error={emailError ?? undefined}
                  required
                  keyboardType="email-address"
                  autoCapitalize="none"
                  textContentType="emailAddress"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  onFocus={() => {
                    // Scroll to bottom when focusing password input
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
                <AppInput
                  ref={phoneRef}
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  value={phone}
                  onChangeText={t => {
                    setPhone(t);
                    setPhoneError(null);
                  }}
                  error={phoneError ?? undefined}
                  required
                  isPhone={true}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => {
                    // Scroll to bottom when focusing password input
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />

                <AppInput
                  ref={passwordRef}
                  label="Mật khẩu"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={t => {
                    setPassword(t);
                    setPasswordError(null);
                  }}
                  error={passwordError ?? undefined}
                  secureTextEntry
                  required
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                  onFocus={() => {
                    // Scroll to bottom when focusing password input
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                  }}
                />
              </View>

              <AppButton title="Xác thực email" onPress={handleRegister} />

              {/* Register link */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-base font-normal text-text-muted">
                  Đã có tài khoản?
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    navigation.navigate('Login');
                  }}
                >
                  <Text className="text-secondary-100 text-base font-bold ml-2 ">
                    Đăng nhập
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SubLayout>
  );
}
