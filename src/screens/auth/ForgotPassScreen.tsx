import React, { useState, useRef } from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { getOtpByEmail } from '../../services/authService';

const forgotPass = require('../../assets/images/forgotPass.png');

type ForgotPassScreenParams = {
  type?: 'forgot_password' | 'verify_account';
  email?: string;
};

type ForgotPassScreenRouteProp = RouteProp<
  { ForgotPass: ForgotPassScreenParams },
  'ForgotPass'
>;

export default function ForgotPassScreen() {
  const emailRef = useRef<TextInput | null>(null);
  const route = useRoute<ForgotPassScreenRouteProp>();
  const type = route.params?.type || 'forgot_password';
  const initialEmail = route.params?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const content = {
    forgot_password: {
      title: 'Quên mật khẩu!',
      description:
        'Vui lòng nhập email của bạn, chúng tôi sẽ gửi mã OTP xác nhận đến địa chỉ này.',
      buttonText: 'Gửi yêu cầu',
      successTitle: 'Yêu cầu thành công',
      successMessage: 'Mã OTP đã được gửi đến email của bạn',
    },
    verify_account: {
      title: 'Xác thực tài khoản!',
      description:
        'Vui lòng nhập email của bạn để nhận mã OTP xác thực tài khoản.',
      buttonText: 'Nhận mã OTP',
      successTitle: 'Gửi thành công',
      successMessage: 'Mã OTP xác thực đã được gửi đến email của bạn',
    },
  };
  const handleVerify = async () => {
    Keyboard.dismiss();
    try {
      setLoading(true);
      await getOtpByEmail(email.toLocaleLowerCase().trim());
      Toast.show({
        type: 'success',
        text1: content[type].successTitle,
        text2: content[type].successMessage,
      });
      navigation.navigate('Verify', { email, type });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Thất bại',
        text2: 'Địa chỉ email không hợp lệ hoặc không tồn tại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white px-6 items-center justify-center">
        {/* Logo */}
        <View className="w-28 h-28 items-center justify-center mb-8">
          <Image
            source={forgotPass}
            className="w-40 h-40"
            resizeMode="contain"
          />
        </View>

        {/* Welcome text */}
        <Text className="text-center text-2xl font-bold text-text-main mb-2">
          {type === 'forgot_password' ? (
            <>
              Quên <Text className="text-primary-100">mật khẩu!</Text>
            </>
          ) : (
            <>
              Xác thực <Text className="text-primary-100">tài khoản!</Text>
            </>
          )}
        </Text>
        <Text className="text-center text-sm text-text-muted mb-8">
          {content[type].description}
        </Text>

        {/* Input fields */}
        <View style={{ width: '100%', gap: 16, marginBottom: 16 }}>
          <AppInput
            ref={emailRef}
            label="Email"
            placeholder="Nhập email của bạn"
            value={email}
            onChangeText={t => {
              setEmail(t);
            }}
            isEmail={true}
            required
            returnKeyType="next"
            onSubmitEditing={handleVerify}
            editable={type !== 'verify_account'}
          />
        </View>

        <AppButton
          title={content[type].buttonText}
          onPress={handleVerify}
          loading={loading}
          disabled={!email.trim() || loading}
        />

        {/* Register link */}
        <View className="flex-row justify-center mt-6">
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('DeliveryLogin');
            }}
          >
            <Text className="text-primary-100 text-base font-bold ml-2 ">
              Đăng nhập ngay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
