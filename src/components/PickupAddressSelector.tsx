import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ParamListBase } from '@react-navigation/native';

interface RootStackParamList extends ParamListBase {
  AddressSelectionScreen: {
    setSelectedAddress: (address: Address) => void;
    selectedAddress: Address;
  };
}

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddressSelectionScreen'
>;

interface Address {
  address: string;
}

interface PickupAddressSelectorProps {
  selectedAddress: Address;
  setSelectedAddress: (address: Address) => void;
}

const PickupAddressSelector: React.FC<PickupAddressSelectorProps> = ({
  selectedAddress,
  setSelectedAddress,
}) => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <>
      <Text className="text-sm font-medium mb-2 text-text-main">
        Địa chỉ lấy hàng <Text className="text-red-500"> *</Text>
      </Text>
      <View className="flex-row justify-between border border-gray-300 rounded-md px-4 py-3 mb-4">
        <View className="flex w-4/5">
          <Text className="text-sm text-text-main">
            {selectedAddress.address}
          </Text>
        </View>
        <TouchableOpacity
          className="justify-center"
          onPress={() =>
            navigation.navigate('AddressSelectionScreen', {
              setSelectedAddress,
              selectedAddress,
            })
          }
        >
          <Icon name="chevron-right" size={20} color="gray" />
        </TouchableOpacity>
      </View>
    </>
  );
};

export default PickupAddressSelector;
