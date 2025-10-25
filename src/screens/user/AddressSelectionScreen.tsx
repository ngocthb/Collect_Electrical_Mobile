import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import addrService from '../../services/mockAddressService';

type AddressItem = {
  id: number;
  name: string;
  phone: string;
  address: string;
  outdated: boolean;
};

const AddressSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [loading, setLoading] = useState(false);

  const maskPhone = (p?: string) => {
    if (!p) return '';
    const chars = p.split('');
    let toMask = 3;
    for (let i = chars.length - 1; i >= 0 && toMask > 0; i--) {
      if (/\d/.test(chars[i])) {
        chars[i] = 'x';
        toMask -= 1;
      }
    }
    return chars.join('');
  };

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  // load addresses on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const list = await addrService.list();
      if (mounted) setAddresses(list);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // reload addresses whenever this screen is focused (so newly created
  // addresses from CreateAddressScreen appear immediately)
  useFocusEffect(
    useCallback(() => {
      reloadAddresses();

      // if a createdId (or createdAddressId) was passed, pre-select it
      const createdId =
        route.params?.createdId || route.params?.createdAddressId;
      if (createdId) {
        setSelectedAddressId(createdId);
        try {
          // clear both possible param names to be safe
          navigation.setParams({
            createdId: undefined,
            createdAddressId: undefined,
          });
        } catch (e) {}
      }
    }, [route.params?.createdId]),
  );

  // When route provides a selectedAddress, try to pre-select it after addresses load
  useEffect(() => {
    if (!route.params?.selectedAddress || addresses.length === 0) return;

    const incoming = route.params.selectedAddress.address || '';
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize?.('NFD')
        .replace(/[\u0000-\u007F]/g, m => m) // noop fallback for old engines
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^\w\s]/g, '')
        .trim();

    const safeNormalize = (s: string) =>
      s
        .toLowerCase()
        .normalize?.('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s]/g, '')
        .trim();

    const inNorm = (() => {
      try {
        return normalize(incoming);
      } catch (e) {
        return safeNormalize(incoming);
      }
    })();

    const defaultAddress = addresses.find(addr => {
      const a = (() => {
        try {
          return normalize(addr.address || '');
        } catch (e) {
          return safeNormalize(addr.address || '');
        }
      })();

      const match = a === inNorm || a.includes(inNorm) || inNorm.includes(a);
      // eslint-disable-next-line no-console
      console.log('[AddressSelection] comparing', {
        incoming: inNorm,
        candidate: a,
        match,
      });
      return match;
    });

    if (defaultAddress) setSelectedAddressId(defaultAddress.id);
  }, [route.params?.selectedAddress, addresses]);

  // Handle returned location from MapboxLocationPicker for create/update
  useEffect(() => {
    const loc = route.params?.location;
    const action = route.params?.action; // 'create' | 'edit'
    const addressId = route.params?.addressId;
    if (!loc || !action) return;

    const process = async () => {
      setLoading(true);
      try {
        if (action === 'create') {
          // Protect against race: do not create if already at max
          if ((await addrService.list()).length >= 5) {
            Alert.alert(
              'Giới hạn địa chỉ',
              'Không thể tạo thêm địa chỉ — đã đạt số lượng tối đa 5 địa chỉ.',
            );
          } else {
            const creatorName = route.params?.creatorName;
            const creatorPhone = route.params?.creatorPhone;

            const newAddr = await addrService.create({
              name: creatorName || 'Người dùng',
              phone: creatorPhone || '+84 900 000 000',
              address: loc.name || loc.place_name || 'Địa chỉ mới',
              latitude: loc.latitude,
              longitude: loc.longitude,
              outdated: false,
            });
            await reloadAddresses();
            setSelectedAddressId(newAddr.id);
          }
        } else if (action === 'edit' && addressId) {
          const creatorName = route.params?.creatorName;
          const creatorPhone = route.params?.creatorPhone;

          const patch: any = {
            address: loc.name || loc.place_name || 'Địa chỉ cập nhật',
            latitude: loc.latitude,
            longitude: loc.longitude,
          };
          if (creatorName) patch.name = creatorName;
          if (creatorPhone) patch.phone = creatorPhone;

          await addrService.update(addressId, patch);
          await reloadAddresses();
          setSelectedAddressId(addressId);
        }
      } finally {
        setLoading(false);
        // clear params to avoid re-processing
        try {
          navigation.setParams({
            location: undefined,
            action: undefined,
            addressId: undefined,
            creatorName: undefined,
            creatorPhone: undefined,
          });
        } catch (e) {
          // ignore if not supported
        }
      }
    };

    process();
  }, [route.params?.location, route.params?.action, route.params?.addressId]);

  const reloadAddresses = async () => {
    const list = await addrService.list();
    setAddresses(list);
  };

  const createNewAddress = () => {
    // Enforce max 5 addresses
    if (addresses.length >= 5) {
      Alert.alert('Giới hạn địa chỉ', 'Bạn đã đạt số lượng tối đa 5 địa chỉ.');
      return;
    }

    // Navigate to the new CreateAddress form where user can enter name/phone
    // before choosing the location on the map.
    navigation.navigate('CreateAddress');
  };

  const handleEditAddress = (id: number) => {
    // Open the CreateAddress form in edit mode so user sees existing name/phone
    // and can choose to edit them before picking a new map location.
    const item = addresses.find(a => a.id === id);
    navigation.navigate('CreateAddress', {
      action: 'edit',
      addressId: id,
      initialName: item?.name,
      initialPhone: item?.phone,
    });
  };

  const handleDeleteAddress = async (id: number) => {
    // Prevent deleting the last remaining address
    if (addresses.length <= 1) {
      Alert.alert('Không thể xóa', 'Phải có ít nhất một địa chỉ.');
      return;
    }

    setLoading(true);
    try {
      await addrService.remove(id);
      if (selectedAddressId === id) setSelectedAddressId(null);
      await reloadAddresses();
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = () => {
    if (!selectedAddressId) {
      Alert.alert(
        'Chọn địa chỉ',
        'Vui lòng chọn một địa chỉ trước khi xác nhận.',
      );
      return;
    }

    const selectedAddress = addresses.find(
      addr => addr.id === selectedAddressId,
    );

    if (!selectedAddress) {
      Alert.alert('Lỗi', 'Không tìm thấy địa chỉ đã chọn.');
      return;
    }

    setLoading(true);

    if (route.params?.setSelectedAddress) {
      // ✅ THÊM LOG
      console.log('[handleSelectAddress] Calling setter with:', {
        address: selectedAddress.address,
      });

      try {
        route.params.setSelectedAddress({ address: selectedAddress.address });
      } catch (e) {
        console.warn('[AddressSelection] setter call failed', e);
      }

      setTimeout(() => {
        setLoading(false);
        navigation.goBack();
      }, 250);
      return;
    }

    // ✅ THÊM LOG
    console.log('[handleSelectAddress] Navigating to CreateRequest with:', {
      address: selectedAddress.address,
    });

    navigation.navigate({
      name: 'CreateRequest',
      params: { selectedAddress: { address: selectedAddress.address } },
      merge: true,
    });

    setTimeout(() => setLoading(false), 250);
  };

  return (
    <SubLayout title="Chọn địa chỉ" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Add New Address Button */}
          <TouchableOpacity
            className={`border-2 border-dashed rounded-2xl p-5 mb-4 flex-row items-center ${
              addresses.length >= 5
                ? 'bg-gray-100 border-gray-200 opacity-60'
                : 'bg-white border-blue-300'
            }`}
            onPress={createNewAddress}
            disabled={addresses.length >= 5}
          >
            <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
              <MaterialIcon name="map-marker-plus" size={26} color="#3B82F6" />
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-base mb-1">
                Thêm địa chỉ mới
              </Text>
              <Text className="text-gray-500 text-xs">
                Chọn vị trí trên bản đồ
              </Text>
              {addresses.length >= 5 && (
                <Text className="text-red-500 text-xs mt-1">
                  Đã đạt số lượng tối đa (5 địa chỉ)
                </Text>
              )}
            </View>
            <Icon name="chevron-forward" size={24} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Saved Addresses Label */}
          <View className="flex-row items-center mb-3">
            <MaterialIcon
              name="map-marker-multiple"
              size={20}
              color="#6B7280"
            />
            <Text className="text-gray-500 font-semibold text-sm ml-2">
              Địa chỉ đã lưu
            </Text>
            <View className="flex-1 h-px bg-gray-200 ml-3" />
          </View>

          {/* Address List */}
          {addresses.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              className={`bg-white rounded-2xl p-5 mb-3 border-2 ${
                selectedAddressId === item.id
                  ? 'border-green-500'
                  : 'border-gray-100'
              }`}
              onPress={() => setSelectedAddressId(item.id)}
              style={
                selectedAddressId === item.id
                  ? {
                      shadowColor: '#10B981',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  : {}
              }
            >
              {/* Header with Radio and Badge */}
              <View className="flex-row items-start mb-3">
                <View className="mr-3 mt-1">
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      selectedAddressId === item.id
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {selectedAddressId === item.id && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>

                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-900 font-bold text-base">
                      {item.name}
                    </Text>
                  </View>

                  {/* Phone */}
                  <View className="flex-row items-center mb-2">
                    <MaterialIcon name="phone" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {maskPhone(item.phone)}
                    </Text>
                  </View>

                  {/* Address */}
                  <View className="flex-row items-start">
                    <MaterialIcon
                      name="map-marker"
                      size={14}
                      color="#6B7280"
                      className="mt-1"
                    />
                    <Text className="flex-1 text-gray-700 text-sm ml-2 leading-5">
                      {item.address}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              {selectedAddressId === item.id && (
                <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity
                    className="flex-1 bg-blue-50 rounded-xl py-2.5 flex-row items-center justify-center"
                    onPress={() => handleEditAddress(item.id)}
                    disabled={loading}
                  >
                    <MaterialIcon name="pencil" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold text-sm ml-1.5">
                      Sửa
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className={`flex-1 rounded-xl py-2.5 flex-row items-center justify-center ${
                      loading || addresses.length <= 1
                        ? 'opacity-50'
                        : 'bg-red-50'
                    }`}
                    onPress={() => handleDeleteAddress(item.id)}
                    disabled={loading || addresses.length <= 1}
                  >
                    <MaterialIcon name="delete" size={16} color="#EF4444" />
                    <Text className="text-red-600 font-semibold text-sm ml-1.5">
                      Xóa
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          ))}

          <View className="h-20" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        {
          <View
            className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <AppButton
              title="Xác nhận địa chỉ"
              onPress={handleSelectAddress}
              loading={loading}
              disabled={!selectedAddressId}
            />
          </View>
        }
      </View>
    </SubLayout>
  );
};

export default AddressSelectionScreen;
