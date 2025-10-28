import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Alert } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import AppInput from '../../components/ui/AppInput';
import addrService from '../../services/mockAddressService';
import draftService from '../../services/draftService';
import { LocationData } from '../../components/MapboxPicker';
import { useFocusEffect } from '@react-navigation/native';
import { validatePhoneNumber, validateFullName } from '../../utils/validations';

const CreateAddressScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [addressInput, setAddressInput] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [forceUpdateKey, setForceUpdateKey] = useState(0);

  const nameRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const hasLoadedRef = useRef(false);
  const processedLocationRef = useRef(false);

  const action = route.params?.action || 'create';
  const addressId = route.params?.addressId;

  useEffect(() => {
    if (action === 'edit' && addressId && !hasLoadedRef.current) {
      hasLoadedRef.current = true; // Đánh dấu đã load
      loadAddressData();
    }
    (async () => {
      if (action !== 'edit') {
        const draft = await draftService.getCreateAddressDraft();
        if (draft) {
          console.log('[CreateAddress] loaded draft', draft);
          if (draft.name) setName(draft.name);
          if (draft.phone) setPhone(draft.phone);
          if (draft.address) {
            setAddressInput(draft.address);
            setSelectedLocation(
              draft.latitude && draft.longitude
                ? {
                    name: draft.address,
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                  }
                : null,
            );
          }
        }
      }
    })();
  }, []);

  const loadAddressData = async () => {
    try {
      const addr = await addrService.get(addressId);
      if (addr) {
        setName(addr.name || '');
        setPhone(addr.phone || '');

        if (!processedLocationRef.current) {
          setAddressInput(addr.address || '');

          if (addr.latitude && addr.longitude) {
            setSelectedLocation({
              name: addr.address,
              latitude: addr.latitude,
              longitude: addr.longitude,
            });
          }
        }
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải thông tin địa chỉ');
      navigation.goBack();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      const loc = route.params?.location as LocationData | undefined;
      if (loc) {
        processedLocationRef.current = true;
        hasLoadedRef.current = true;
        setSelectedLocation(loc);
        const newAddress = loc.name || '';
        setAddressInput(newAddress);
        setForceUpdateKey(prev => prev + 1);

        try {
          navigation.setParams({ location: undefined });
        } catch (e) {
          console.warn('Failed to clear location param', e);
        }

        try {
          draftService
            .saveCreateAddressDraft({
              name,
              phone,
              address: newAddress,
              latitude: loc.latitude,
              longitude: loc.longitude,
            })
            .catch(() => {});
        } catch (e) {}
      }
    }, [route.params?.location]),
  );

  const goToMap = () => {
    navigation.navigate('MapboxLocationScreen', {
      returnTo: 'CreateAddress',
      action,
      addressId,
      currentLocation: selectedLocation,
    });
  };

  const handleNameChange = (t: string) => {
    setName(t);
    setNameError(null);

    try {
      draftService
        .saveCreateAddressDraft({
          name: t,
          phone,
          address: addressInput,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
        })
        .catch(() => {});
    } catch (e) {}
  };

  const handlePhoneChange = (t: string) => {
    setPhone(t);
    setPhoneError(null);
    try {
      draftService
        .saveCreateAddressDraft({
          name,
          phone: t,
          address: addressInput,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
        })
        .catch(() => {});
    } catch (e) {}
  };

  const handleAddressChange = (text: string) => {
    setAddressInput(text);
    draftService
      .saveCreateAddressDraft({
        name,
        phone,
        address: text,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
      })
      .catch(() => {});
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
    const finalAddress = selectedLocation?.name || addressInput;
    if (!finalAddress || !finalAddress.trim()) {
      Alert.alert(
        'Thiếu thông tin',
        'Vui lòng nhập hoặc chọn vị trí trước khi lưu',
      );
      return;
    }

    try {
      if (action === 'edit' && addressId) {
        await addrService.update(addressId, {
          name: name || 'Người dùng',
          phone: phone || '+84 900 000 000',
          address: finalAddress,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
        });

        Alert.alert('Thành công', 'Cập nhật địa chỉ thành công');

        navigation.navigate('AddressSelectionScreen', {
          createdAddressId: addressId,
        });
      } else {
        const newAddr = await addrService.create({
          name: name || 'Người dùng',
          phone: phone || '+84 900 000 000',
          address: finalAddress,
          latitude: selectedLocation?.latitude,
          longitude: selectedLocation?.longitude,
          outdated: false,
        });

        Alert.alert('Thành công', 'Thêm địa chỉ mới thành công');

        navigation.navigate('AddressSelectionScreen', {
          createdAddressId: newAddr.id,
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu địa chỉ. Vui lòng thử lại.');
    }

    try {
      draftService.clearCreateAddressDraft().catch(() => {});
    } catch (e) {}
  };

  return (
    <SubLayout
      title={action === 'edit' ? 'Chỉnh sửa địa chỉ' : 'Tạo địa chỉ mới'}
      onBackPress={() => navigation.navigate('AddressSelectionScreen')}
    >
      <View className="flex-1 bg-white px-5 py-6">
        <AppInput
          ref={nameRef}
          label="Tên người dùng"
          placeholder="Nhập tên người dùng"
          value={name}
          onChangeText={handleNameChange}
          error={nameError ?? undefined}
          required
        />

        <AppInput
          ref={phoneRef}
          label="Số điện thoại liên hệ"
          placeholder="Nhập số điện thoại"
          value={phone}
          onChangeText={handlePhoneChange}
          error={phoneError ?? undefined}
          isPhone={true}
          required
        />

        <AppInput
          key={`address-${forceUpdateKey}`}
          label="Địa chỉ"
          placeholder="Chọn vị trí từ bản đồ"
          value={addressInput}
          onChangeText={handleAddressChange}
          required
        />

        <AppButton title="Chọn trên bản đồ" onPress={goToMap} size="small" />

        <View className="flex-grow justify-end">
          <AppButton
            title={action === 'edit' ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
            onPress={handleSave}
          />
        </View>
      </View>
    </SubLayout>
  );
};

export default CreateAddressScreen;
