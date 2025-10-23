import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';

type AddressItem =
  | {
      id: number;
      name: string;
      phone: string;
      address: string;
      outdated: boolean;
    }
  | { id: string; isNew: boolean };

const addresses = [
  {
    id: 1,
    name: 'Trần Ngọc',
    phone: '+84 949 306 739',
    address:
      'Trường mầm non Tuổi Thơ KP3, Phường Trảng Dài, Thành Phố Biên Hòa, Đồng Nai',
    outdated: true,
  },
  {
    id: 2,
    name: 'Trần Ngọc',
    phone: '+84 949 117 939',
    address:
      'Gần Trường Tiểu Học Trảng Dài, Đường Nguyễn Khuyến, Phường Trảng Dài, Thành Phố Biên Hòa, Đồng Nai',
    outdated: false,
  },
  {
    id: 3,
    name: 'Nguyễn Hoàng Minh Thư',
    phone: '+84 948 855 509',
    address:
      'Vinhomes Grand Park, Nguyễn Xiển Tòa S902, Phường Long Thạnh Mỹ, Thành Phố Thủ Đức, TP. Hồ Chí Minh',
    outdated: false,
  },
];

const AddressSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    if (route.params?.selectedAddress) {
      const defaultAddress = addresses.find(
        addr => addr.address === route.params.selectedAddress.address,
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [route.params?.selectedAddress]);

  const handleSelectAddress = () => {
    if (selectedAddressId) {
      const selectedAddress = addresses.find(
        addr => addr.id === selectedAddressId,
      );
      if (selectedAddress && route.params?.setSelectedAddress) {
        route.params.setSelectedAddress({ address: selectedAddress.address });
        navigation.goBack();
      }
    }
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
            className="bg-white border-2 border-dashed border-blue-300 rounded-2xl p-5 mb-4 flex-row items-center"
            onPress={() => navigation.navigate('MapboxLocationScreen')}
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
                    {item.outdated && (
                      <View className="bg-amber-100 rounded-full px-3 py-1">
                        <Text className="text-amber-700 text-xs font-semibold">
                          Cũ
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Phone */}
                  <View className="flex-row items-center mb-2">
                    <MaterialIcon name="phone" size={14} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">
                      {item.phone}
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
                  <TouchableOpacity className="flex-1 bg-blue-50 rounded-xl py-2.5 flex-row items-center justify-center">
                    <MaterialIcon name="pencil" size={16} color="#3B82F6" />
                    <Text className="text-blue-600 font-semibold text-sm ml-1.5">
                      Sửa
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 bg-red-50 rounded-xl py-2.5 flex-row items-center justify-center">
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
        {selectedAddressId && (
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
            <AppButton title="Xác nhận địa chỉ" onPress={handleSelectAddress} />
          </View>
        )}
      </View>
    </SubLayout>
  );
};

export default AddressSelectionScreen;
