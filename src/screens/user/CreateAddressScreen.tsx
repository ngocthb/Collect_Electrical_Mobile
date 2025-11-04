import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';

import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { clearAddress } from '../../store/slices/addressSlice';
import { validateFullName, validatePhoneNumber } from '../../utils/validations';

import addrService from '../../services/mockAddressService';
import { addAddress, updateAddress } from '../../store/slices/addressSlice';

const CreateAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const address = useAppSelector(state => state.address.current);
  const [name, setName] = useState<string>(address?.name || '');
  const [phone, setPhone] = useState<string>(address?.phone || '');
  const [addressInput, setAddressInput] = useState<string>(
    address?.address || '',
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [forceUpdateKey] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const nameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const goToMap = () => {
    navigation.navigate('MapboxLocationScreen');
  };

  const handleSave = async () => {
    const nameValidation = validateFullName(name || '');
    if (nameValidation) {
      setNameError(nameValidation);
      nameRef.current?.focus();
      return;
    }

    const phoneValidation = validatePhoneNumber(phone || '');
    if (phoneValidation) {
      setPhoneError(phoneValidation);
      phoneRef.current?.focus();
      return;
    }

    if (!addressInput || !addressInput.trim()) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập hoặc chọn vị trí trước khi lưu',
      );
      return;
    }

    try {
      const payload = {
        name: name,
        phone: phone,
        address: addressInput,
        latitude: latitude,
        longitude: longitude,
      };
      if (address.id !== '0') {
        const updated = await addrService.update(address.id, payload);
        if (updated) {
          dispatch(updateAddress({ ...updated, id: address.id }));
        }

        Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');
      } else {
        const newAddress = await addrService.create(payload);
        dispatch(addAddress(newAddress));
        Alert.alert('Thành công', 'Thêm địa chỉ mới thành công');
      }
      handleBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }
  };

  const handleBack = () => {
    dispatch(clearAddress());
    navigation.goBack();
  };
  const handleDiscardChanges = () => {
    if (isDirty) {
      Alert.alert(
        'Bỏ thay đổi?',
        'Bạn có chắc chắn muốn bỏ các thay đổi chưa được lưu?',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Đồng ý', onPress: () => handleBack() },
        ],
      );
    } else {
      handleBack();
    }
  };

  useEffect(() => {
    if (address) {
      setAddressInput(address.address ?? '');
      setLatitude(address.latitude ?? 0);
      setLongitude(address.longitude ?? 0);
    }
  }, [address]);

  return (
    <SubLayout
      title={address.id !== '0' ? 'Chỉnh sửa địa chỉ' : 'Tạo địa chỉ mới'}
      onBackPress={handleDiscardChanges}
    >
      <View className="flex-1 bg-white px-5 py-6">
        <AppInput
          ref={nameRef}
          label="Tên người dùng"
          placeholder="Nhập tên người dùng"
          value={name}
          onChangeText={text => {
            setName(text);
            setIsDirty(true);
          }}
          error={nameError ?? undefined}
          required
        />

        <AppInput
          ref={phoneRef}
          label="Số điện thoại liên hệ"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChangeText={text => {
            setPhone(text);
            setIsDirty(true);
          }}
          error={phoneError ?? undefined}
          isPhone={true}
          required
        />

        <AppInput
          key={`address-${forceUpdateKey}`}
          label="Địa chỉ"
          placeholder="Chọn vị trí từ bản đồ"
          value={addressInput}
          onChangeText={text => {
            setAddressInput(text);
            setIsDirty(true);
          }}
          numberOfLines={4}
          required
        />

        <AppButton title="Chọn trên bản đồ" onPress={goToMap} size="small" />

        <View className="flex-grow justify-end">
          <AppButton
            title={address.id !== '0' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            onPress={handleSave}
          />
        </View>
      </View>
    </SubLayout>
  );
};

export default CreateAddressScreen;
