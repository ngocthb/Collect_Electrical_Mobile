import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AppInput from '../../components/ui/AppInput';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (
    password: string,
  ): { score: number; label: string; color: string } => {
    if (!password) return { score: 0, label: '', color: '#e5e7eb' };

    let score = 0;
    let label = '';
    let color = '';

    // Length check
    if (password.length >= 8) score += 2;
    else if (password.length >= 6) score += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;

    // Contains numbers
    if (/\d/.test(password)) score += 1;

    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2;

    // Determine strength level (5 levels)
    if (score <= 1) {
      label = 'Rất yếu';
      color = '#dc2626';
    } else if (score <= 2) {
      label = 'Yếu';
      color = '#ef4444';
    } else if (score <= 3) {
      label = 'Trung bình';
      color = '#f59e0b';
    } else if (score <= 4) {
      label = 'Mạnh';
      color = '#10b981';
    } else {
      label = 'Rất mạnh';
      color = '#059669';
    }

    return { score: Math.min(score, 5), label, color };
  };

  const passwordStrength = calculatePasswordStrength(newPassword);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mật khẩu hiện tại',
      });
      return;
    }

    if (!newPassword.trim()) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mật khẩu mới',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Xác nhận mật khẩu không khớp',
      });
      return;
    }

    if (currentPassword === newPassword) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      });
      return;
    }

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

      // Mock success
      toast.show({
        type: 'confirm',
        text1: 'Thành công',
        text2: 'Đã thay đổi mật khẩu thành công',
        autoHide: false,
        props: {
          button1: 'OK',
          button2: 'Đóng',
          onCancel: () => {
            toast.hide();
          },
          onConfirm: () => {
            toast.hide();
            navigation.goBack();
          },
        },
      });
    } catch (error) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể thay đổi mật khẩu. Vui lòng thử lại',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SubLayout title="Đổi mật khẩu" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-white rounded-2xl p-4 mb-4">
          <AppInput
            label="Mật khẩu hiện tại"
            placeholder="Nhập mật khẩu hiện tại"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            required
          />

          <AppInput
            label="Mật khẩu mới"
            placeholder="Nhập mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            required
          />

          {/* Password Strength Meter */}
          {newPassword.length > 0 && (
            <View className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-gray-600">Độ mạnh mật khẩu:</Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.label}
                </Text>
              </View>

              <View className="flex-row space-x-1">
                {[1, 2, 3, 4, 5].map(level => (
                  <View
                    key={level}
                    className="flex-1 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        level <= passwordStrength.score
                          ? passwordStrength.color
                          : '#e5e7eb',
                    }}
                  />
                ))}
              </View>

              <View className="mt-2">
                <Text className="text-xs text-gray-500">
                  Mật khẩu mạnh nên có ít nhất 8 ký tự, bao gồm chữ hoa, chữ
                  thường, số và ký tự đặc biệt
                </Text>
              </View>
            </View>
          )}

          <AppInput
            label="Xác nhận mật khẩu mới"
            placeholder="Nhập lại mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            required
          />

          <View className="mt-4">
            <AppButton
              title={loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
              onPress={handleChangePassword}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default ChangePasswordScreen;
