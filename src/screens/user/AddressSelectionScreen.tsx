import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  useEffect(() => {
    if (route.params?.selectedAddress) {
      const defaultAddress = addresses.find(
        addr => addr.address === route.params.selectedAddress.address,
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [route.params]);

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
  const data: AddressItem[] = [...addresses, { id: 'new', isNew: true }];

  return (
    <SubLayout title="Chọn địa chỉ" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-white px-4 py-4 mb-4">
        <FlatList
          data={data}
          keyExtractor={item =>
            'isNew' in item && item.isNew ? 'new' : String(item.id)
          }
          renderItem={({ item }) =>
            'isNew' in item && item.isNew ? (
              <View
                className="border-2 border-dashed border-gray-400 rounded-md px-4 py-3 mb-4 flex-row items-center justify-center"
                onTouchEnd={() => navigation.navigate('MapboxLocationScreen')}
              >
                <Icon name="add" size={20} color="gray" className="mr-2" />
                <Text className="text-text-muted font-medium">
                  Thêm Địa Chỉ Mới
                </Text>
              </View>
            ) : (
              (() => {
                const addressItem = item as Exclude<
                  AddressItem,
                  { isNew: boolean }
                >;

                return (
                  <View className="border border-gray-300 rounded-md px-4 py-3 mb-2">
                    <TouchableOpacity
                      className="flex-row items-center mb-2"
                      onPress={() => setSelectedAddressId(addressItem.id)}
                    >
                      <View className="mr-3">
                        <Icon
                          name={
                            selectedAddressId === addressItem.id
                              ? 'radio-button-on'
                              : 'radio-button-off'
                          }
                          size={20}
                          color={
                            selectedAddressId === addressItem.id
                              ? '#19CCA1'
                              : '#9CA3AF'
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-text-main ">
                          {addressItem.address}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })()
            )
          }
        />
        {selectedAddressId && (
          <AppButton title="Chọn địa chỉ này" onPress={handleSelectAddress} />
        )}
      </View>
    </SubLayout>
  );
};

export default AddressSelectionScreen;
