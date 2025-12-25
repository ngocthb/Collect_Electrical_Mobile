import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import AppButton from '../../components/ui/AppButton';
import OtpInput from '../../components/ui/OtpInput';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { AuthStackParamList } from '../../navigation/AuthNavigator';
import { getOtpByEmail, verifyOtp } from '../../services/authService';
import Toast from 'react-native-toast-message';

const verify = require('../../assets/images/verify.png');

type VerifyScreenRouteProp = RouteProp<AuthStackParamList, 'Verify'>;

export default function VerifyScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<VerifyScreenRouteProp>();
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const email = route.params?.email || '';

  useEffect(() => {
    setCountdown(30);
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = async () => {
    try {
      setLoadingVerify(true);
      await verifyOtp(email, code);
      Toast.show({
        type: 'success',
        text1: 'Xác thực thành công',
        text2: 'Mã OTP hợp lệ',
      });
      navigation.navigate('ChangePass', { email });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Xác thực thất bại',
        text2: 'Mã OTP không hợp lệ hoặc đã hết hạn',
      });
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    await getOtpByEmail(email);
    setCode('');
    Toast.show({
      type: 'success',
      text1: 'Gửi lại thành công',
      text2: 'Mã OTP mới đã được gửi đến email của bạn',
    });

    setCountdown(30);
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View className="flex-1 bg-white px-6 items-center justify-center">
        {/* Logo */}
        <View className="w-28 h-28 items-center justify-center mb-8">
          <Image source={verify} className="w-32 h-32" resizeMode="contain" />
        </View>

        {/* Title */}
        <Text className="text-center text-2xl font-bold text-text-main mb-2">
          Xác thực <Text className="text-primary-100">OTP</Text>
        </Text>
        <Text className="text-center text-sm text-text-muted mb-2">
          Nhập mã OTP được gửi về email
        </Text>
        {email ? (
          <Text className="text-center text-sm text-primary-100 font-semibold mb-6">
            {email}
          </Text>
        ) : (
          <View className="mb-6" />
        )}

        {/* OTP inputs */}
        <View className="mb-6">
          <OtpInput
            length={6}
            onChange={setCode}
            onComplete={code => {
              setCode(code);
            }}
            onSubmitEditing={handleVerify}
            value={code}
          />
        </View>

        <AppButton
          title="Xác thực ngay"
          onPress={handleVerify}
          loading={loadingVerify}
          disabled={code.length < 6 || loadingVerify}
        />

        <View className="mt-4 items-center">
          <View className="flex-row items-center">
            <Text className="text-text-muted">Bạn chưa nhận được OTP? </Text>
            {countdown > 0 ? (
              <Text className="text-primary-100 font-semibold">
                Gửi lại trong {String(countdown).padStart(2, '0')}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text className="font-semibold text-primary-100">
                  Gửi lại ngay
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

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
