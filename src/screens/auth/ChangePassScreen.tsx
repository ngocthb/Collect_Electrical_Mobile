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

import Toast from 'react-native-toast-message';
import { changePassword } from '../../services/authService';

const changePass = require('../../assets/images/changePass.png');
export default function ChangePassScreen() {

  const newPasswordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const route = useRoute<any>();
  const email = route.params?.email || '';

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu xác nhận không khớp',
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword(email, newPassword, confirmPassword);
      Toast.show({
        type: 'success',
        text1: 'Đổi mật khẩu thành công',
        text2: 'Vui lòng đăng nhập lại',
      });

      navigation.navigate('DeliveryLogin');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Đổi mật khẩu thất bại',
        text2: 'Vui lòng thử lại',
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
            source={changePass}
            className="w-36 h-36"
            resizeMode="contain"
          />
        </View>

        {/* Welcome text */}
        <Text className="text-center text-2xl font-bold text-text-main mb-2">
          Đặt lại <Text className="text-primary-100">mật khẩu!</Text>
        </Text>
        <Text className="text-center text-sm text-text-muted mb-8">
          Nhập mật khẩu mới để hoàn tất việc đổi mật khẩu
        </Text>

        {/* Input fields */}
        <View style={{ width: '100%', gap: 16 }}>
          <AppInput
            ref={newPasswordRef}
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới của bạn"
            value={newPassword}
            onChangeText={t => {
              setNewPassword(t);
            }}
            secureTextEntry
            required
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          />

          <AppInput
            ref={confirmPasswordRef}
            label="Xác nhận mật khẩu"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={t => {
              setConfirmPassword(t);
            }}
            secureTextEntry
            required
            returnKeyType="done"
            onSubmitEditing={handleChangePassword}
          />
        </View>

        <AppButton
          title="Đổi mật khẩu"
          onPress={handleChangePassword}
          loading={loading}
          disabled={!newPassword || !confirmPassword}
        />

        {/* Back to login link */}
        <View className="flex-row justify-center mt-6">
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('DeliveryLogin');
            }}
          >
            <Text className="text-primary-100 text-base font-bold ml-2 ">
              Quay lại đăng nhập
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}
