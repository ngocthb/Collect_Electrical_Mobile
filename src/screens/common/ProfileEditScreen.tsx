import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import toast from 'react-native-toast-message';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import Icon from 'react-native-vector-icons/Feather';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import AppAvatar from '../../components/ui/AppAvatar';
import ImagePickerModal from '../../components/ImagePickerModal';
import ConfirmModal from '../../components/ConfirmModal';
import type { Asset } from 'react-native-image-picker';
import { updateProfile, deleteAccount } from '../../services/userService';
import { uploadImageToCloudinary } from '../../config/cloudinary';
import { setUser } from '../../store/slices/authSlice';
import { logout } from '../../store/slices/authSlice';
import { signOut } from '../../services/authService';
const { width, height } = Dimensions.get('window');
const ProfileEditScreen: React.FC<any> = ({ navigation }) => {
  const user = useAppSelector(s => s.auth.user);
  const dispatch = useAppDispatch();

  const [name, setName] = useState(user?.name ?? '');
  const [email] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(
    user?.avatar ?? undefined,
  );
  const [selectedImage, setSelectedImage] = useState<Asset | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = async () => {
    if (!name || name.trim().length === 0) {
      toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập tên' });
      return;
    }

    setSaving(true);
    try {
      let uploadedAvatarUrl = avatarUrl || '';

      // Upload image to Cloudinary if a new image was selected
      if (selectedImage && selectedImage.uri) {
        try {
          uploadedAvatarUrl = await uploadImageToCloudinary(selectedImage);
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          toast.show({
            type: 'error',
            text1: 'Lỗi',
            text2: 'Không thể tải ảnh lên',
          });
          setSaving(false);
          return;
        }
      }

      // Call API to update profile
      const response = await updateProfile(user?.userId || '', {
        email: email,
        avatarUrl: uploadedAvatarUrl,
        phoneNumber: phone || '',
      });

      // Update Redux store with new user data
      const updatedUser = {
        ...user,
        avatar: uploadedAvatarUrl,
        phone: phone,
        email: email,
      };
      dispatch(setUser(updatedUser as any));

      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Cập nhật hồ sơ thành công',
      });
      navigation.goBack();
    } catch (e: any) {
      console.error('Failed to save profile', e);
      const errorMessage = e?.response?.data?.message || 'Không thể lưu hồ sơ';
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangeAvatar = () => {
    setPickerVisible(true);
  };

  const handlePickerSelect = (assets: Asset[]) => {
    if (assets && assets.length > 0 && assets[0].uri) {
      setSelectedImage(assets[0]);
      setAvatarUrl(assets[0].uri as string);
    }
    setPickerVisible(false);
  };

  const handlePickerClose = () => {
    setPickerVisible(false);
  };

  const hasChanges =
    name !== (user?.name ?? '') ||
    phone !== (user?.phone ?? '') ||
    selectedImage !== null;
  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    try {
      await deleteAccount(user?.userId || '');

      // Clear token and sign out
      await signOut();

      // Reset redux auth state
      dispatch(logout());

      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Tài khoản đã được xóa',
      });
    } catch (e: any) {
      console.error('Failed to delete account:', e);
      const errorMessage =
        e?.response?.data?.message || 'Không thể xóa tài khoản';
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: errorMessage,
      });
    }
  };

  return (
    <SubLayout
      noScroll
      title="Hồ sơ của tôi"
      onBackPress={() => navigation.goBack()}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View
          className="flex-1  bg-background-50 px-6 "
          style={{ paddingBottom: 20 * (height / 812) }}
        >
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
                disabled={saving}
                style={{
                  position: 'absolute',
                  right: -6,
                  bottom: -6,
                  opacity: saving ? 0.5 : 1,
                }}
              >
                <View
                  style={{
                    width: 40 * (width / 375),
                    height: 40 * (width / 375),
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
              editable={!saving}
            />

            <AppInput label="Email" value={email} disabled />

            <AppInput
              label="Số điện thoại"
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              isPhone
              editable={!saving}
            />

            <AppButton
              title={saving ? 'Đang lưu...' : 'Lưu'}
              onPress={handleSave}
              disabled={!hasChanges || saving}
            />
          </View>

          {/* Delete Account Button */}
          <TouchableOpacity
            onPress={() => setShowDeleteModal(true)}
            disabled={saving}
            className="bg-white border-2 border-red-400 rounded-2xl shadow-sm px-5 py-4 flex-row items-center mb-6"
            activeOpacity={0.7}
            style={{ opacity: saving ? 0.5 : 1 }}
          >
            <View className="w-10 h-10 rounded-full items-center justify-center bg-red-100">
              <Icon name="trash-2" size={20} color="#DC2626" />
            </View>
            <Text className="ml-4 flex-1 text-base text-red-600 font-semibold">
              Xóa tài khoản
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
      <ImagePickerModal
        visible={pickerVisible}
        onClose={handlePickerClose}
        onSelect={handlePickerSelect}
        currentCount={0}
        maxItems={1}
        hideVideoOption={true}
      />
      <ConfirmModal
        visible={showDeleteModal}
        title="Xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
        iconName="alert-triangle"
        iconColor="#DC2626"
      />
    </SubLayout>
  );
};

export default ProfileEditScreen;
