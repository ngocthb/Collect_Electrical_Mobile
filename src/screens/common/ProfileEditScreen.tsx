import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Icon from 'react-native-vector-icons/Feather';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import AppAvatar from '../../components/ui/AppAvatar';
import ImagePickerModal from '../../components/ImagePickerModal';
import type { Asset } from 'react-native-image-picker';

const ProfileEditScreen: React.FC<any> = ({ navigation }) => {
  const user = useAppSelector(s => s.auth.user);

  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatar ?? undefined,
  );
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || name.trim().length === 0) {
      toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên' });
      return;
    }

    setSaving(true);
    try {
      const updated = {
        ...user,
        name: name.trim(),
        phone: phone || undefined,
        address: address || undefined,
        avatar: avatarUrl || undefined,
      };

      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật hồ sơ thành công',
      });
      navigation.goBack();
    } catch (e) {
      console.warn('Failed to save profile', e);
      toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể lưu hồ sơ' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    setPickerVisible(true);
  };

  const handlePickerSelect = (assets: Asset[]) => {
    if (assets && assets.length > 0 && assets[0].uri) {
      setAvatarUrl(assets[0].uri as string);
    }
    setPickerVisible(false);
  };

  const handlePickerClose = () => {
    setPickerVisible(false);
  };

  return (
    <SubLayout title="Hồ sơ của tôi" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1  bg-background-50 px-6 pt-6">
        <View className="items-center mb-6">
          <View>
            <View className="relative bg-primary-100 rounded-full p-1">
              <AppAvatar
                name={name}
                uri={avatarUrl}
                size={120}
                style={{ borderWidth: 4, borderColor: '#fff' }}
              />
            </View>
            <TouchableOpacity
              onPress={handleChangeAvatar}
              style={{ position: 'absolute', right: -6, bottom: -6 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: '#e85a4f',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: 2 },
                  elevation: 3,
                }}
              >
                <Icon name="camera" size={18} color="#FFFF" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-white rounded-2xl p-4 mb-4 border-2 border-red-200">
          <AppInput
            label="Họ và tên"
            placeholder="Họ và tên"
            value={name}
            onChangeText={setName}
          />

          <AppInput label="Email" value={email} disabled />

          <AppInput
            label="Số điện thoại"
            placeholder="Số điện thoại"
            value={phone}
            onChangeText={setPhone}
            isPhone
          />

          <AppButton
            title={saving ? 'Đang lưu...' : 'Lưu'}
            onPress={handleSave}
          />
        </View>
      </ScrollView>
      <ImagePickerModal
        visible={pickerVisible}
        onClose={handlePickerClose}
        onSelect={handlePickerSelect}
        currentCount={0}
        maxItems={1}
        hideVideoOption={true}
      />
    </SubLayout>
  );
};

export default ProfileEditScreen;
